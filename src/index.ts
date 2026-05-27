export interface Env {
  KANBAN_SERVICE: Fetcher;
  ASSETS: Fetcher;
  DB: D1Database;
  KANBAN_KV: KVNamespace;
  APP_NAME: string;
  KANBAN_CONTAINER_HOST: string;
  KANBAN_CONTAINER_PORT: string;
  ENVIRONMENT?: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Kanban-Workspace-Id',
  'Access-Control-Allow-Credentials': 'true',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',

async function proxyToKanban(request: Request, env: Env): Promise<Response> {
  const upstreamUrl = new URL(request.url);
  upstreamUrl.host = `${env.KANBAN_CONTAINER_HOST}:${env.KANBAN_CONTAINER_PORT}`;
  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', request.headers.get('Host') || '');
  headers.set('X-Forwarded-Proto', request.url.startsWith('https') ? 'https' : 'http');
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
  headers.delete('CF-Connecting-IP');
  headers.delete('CF-Ray');
  headers.delete('CF-Visitor');
  const upstream = new Request(upstreamUrl.toString(), {
    method: request.method, headers,
    body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    signal: request.signal,
  });
  try {
    return await env.KANBAN_SERVICE.fetch(upstream);
  } catch (err) {
    console.error('Proxy error:', err);
    return new Response(JSON.stringify({ error: 'Kanban container is not running. It may still be provisioning.' }), { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
  }
}

async function validateSession(kv: KVNamespace, token: string): Promise<boolean> {
  const data = await kv.get(`session:${token}`);
  if (!data) return false;
  try { return JSON.parse(data).expiresAt > Date.now(); } catch { return false; }
}

async function createSession(kv: KVNamespace, userId: string): Promise<string> {
  const token = crypto.randomUUID();
  await kv.put(`session:${token}`, JSON.stringify({ userId, token, expiresAt: Date.now() + 86400000 }), { expirationTtl: 86400 });
  return token;
}

async function checkRateLimit(kv: KVNamespace, key: string, maxR: number, windowSec: number): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const sk = `ratelimit:${key}`;
  const stored = await kv.get<{ count: number; resetAt: number }>(sk, 'json');
  if (stored && stored.resetAt > now) {
    if (stored.count >= maxR) return { allowed: false, remaining: 0 };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });

    if (request.method === 'GET' && pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'clinebox-kanban', environment: env.ENVIRONMENT || 'production', timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...SECURITY_HEADERS } });
    }

    if (pathname === '/api/auth/github/login') {
      const state = crypto.randomUUID();
      const gh = new URL('https://github.com/login/oauth/authorize');
      gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      gh.searchParams.set('redirect_uri', `${url.origin}/api/auth/github/callback`);
      gh.searchParams.set('scope', 'user:email,repo');
      gh.searchParams.set('state', state);
      await env.KANBAN_KV.put(`oauth:state:${state}`, 'github', { expirationTtl: 600 });
      return Response.redirect(gh.toString(), 302);
    }

    if (pathname === '/api/auth/github/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (!code || !state) return new Response('Missing params', { status: 400 });
      const storedState = await env.KANBAN_KV.get(`oauth:state:${state}`);
      if (!storedState) return new Response('Invalid state', { status: 400 });
      await env.KANBAN_KV.delete(`oauth:state:${state}`);
      const tokRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const tokData = await tokRes.json() as { access_token?: string };
      if (!tokData.access_token) return new Response('Auth failed', { status: 401 });
      const userRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${tokData.access_token}` } });
      const ghUser = await userRes.json() as { id: number; login: string };
      const sessionToken = await createSession(env.KANBAN_KV, `github-${ghUser.id}`);
      return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': `kanban_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400` } });
    }

    if (pathname === '/api/auth/session') {
      const match = (request.headers.get('Cookie') || '').match(/kanban_session=([^;]+)/);
      if (!match) return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      const valid = await validateSession(env.KANBAN_KV, match[1]);
      return new Response(JSON.stringify({ authenticated: valid }), { status: valid ? 200 : 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (pathname.startsWith('/api/')) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { allowed, remaining } = await checkRateLimit(env.KANBAN_KV, `worker:${ip}`, 200, 60);
      if (!allowed) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60', ...CORS_HEADERS } });
      const response = await proxyToKanban(request, env);
      const h = new Headers(response.headers);
      h.set('X-RateLimit-Remaining', String(remaining));
      return new Response(response.body, { status: response.status, headers: h });
    }

    if ((request.headers.get('Upgrade') || '').toLowerCase() === 'websocket') return proxyToKanban(request, env);

    try {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status === 200) return asset;
    } catch { /* fall through */ }

    return proxyToKanban(request, env);
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log(`[${env.ENVIRONMENT}] Cline Kanban worker alive at ${new Date().toISOString()}`);
  },
} satisfies ExportedHandler<Env>;

    stored.count += 1;
    await kv.put(sk, JSON.stringify(stored), { expirationTtl: windowSec });
    return { allowed: true, remaining: maxR - stored.count };
  }
  await kv.put(sk, JSON.stringify({ count: 1, resetAt: now + windowSec * 1000 }), { expirationTtl: windowSec });
  return { allowed: true, remaining: maxR - 1 };
}

  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:;",
};
