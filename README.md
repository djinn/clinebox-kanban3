# Cline Kanban — Cloudflare Deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/djinn/clinebox)

One-click deployment of [Cline Kanban](https://github.com/cline/kanban) on Cloudflare Containers.

## What is Cline Kanban?

A web app that runs CLI coding agents in parallel. Each task card gets its own terminal and git worktree. Link cards together for autonomous dependency chains with auto-commit.

## Architecture

```
User Browser ──► Cloudflare Worker (gateway, auth, proxy)
                       │
                       ▼
                Cloudflare Container (Kanban server: port 3484)
                       │
                  ┌────┴────┐
                  │         │
             tRPC API    Web UI (React SPA)
                         WebSocket (terminal I/O)
```

## Deploy

Click the button above. You will need:

- Cloudflare account with **Workers Paid Plan** and **Containers beta** access
- A [GitHub OAuth App](https://github.com/settings/developers) for login
  - Authorization callback: `https://{your-worker}.workers.dev/api/auth/github/callback`

## Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Cloudflare Worker — auth gateway, rate limiting, proxy to container |
| `public/index.html` | Landing page shown while Kanban provisions |
| `wrangler.jsonc` | Cloudflare config — container, D1, KV, assets |

## License

Apache-2.0
