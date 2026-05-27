# SPECS.md

# Project Name

ClineBox

A one-click deployable, enterprise-ready AI coding workspace platform running on Cloudflare Containers.

Inspired by:

* Cline Kanban
* Cloudflare VibeSDK deployment UX
* Replit-style hosted development
* Cursor/Cline agent workflows
* Enterprise secure AI development environments

---

# Vision

Most AI coding tools optimize for demos.

This platform optimizes for sustained engineering work.

The system should allow a developer or enterprise team to:

* Deploy isolated coding environments in minutes
* Connect AI models through Cloudflare AI Gateway
* Use OpenAI-compatible APIs
* Persist workspaces
* Attach Git repositories securely
* Run coding agents safely
* Operate with enterprise governance controls
* Avoid Kubernetes complexity

The product should feel:

* Fast
* Minimal
* Production-grade
* Secure-by-default
* Self-hostable within Cloudflare

---

# Core Product

The platform provisions Cloudflare Container-based development workspaces with:

* Browser-based UI
* SSH access
* AI coding assistant support
* Persistent storage
* Git integration
* AI Gateway integration
* Multi-model support
* Enterprise governance

The deployment experience must resemble:

* [https://deploy.workers.cloudflare.com/](https://deploy.workers.cloudflare.com/)
* [https://github.com/cloudflare/vibesdk](https://github.com/cloudflare/vibesdk)

Users should click:

“Deploy to Cloudflare”

And receive:

* Running container
* Preconfigured AI models
* Secure auth
* Git-ready environment
* Persistent workspace
* Browser IDE

Without touching Kubernetes.

---

# Target Users

## Primary

* Individual developers
* AI engineers
* Platform teams
* DevRel teams
* Startup engineering teams
* Internal enterprise platform teams

## Secondary

* Education
* Hackathons
* Secure coding sandboxes
* GPU inference operators
* AI consulting firms

---

# Key Product Principles

## 1. Serverless Feel

Infrastructure should disappear.

Users should not:

* Configure Kubernetes
* Provision VMs manually
* Configure ingress manually
* Configure networking manually
* Install Docker locally

---

## 2. AI Gateway First

All AI traffic routes through Cloudflare AI Gateway.

Never expose raw provider endpoints to frontend clients.

---

## 3. Enterprise Ready

The product must support:

* Audit logging
* RBAC
* Cost governance
* Approved model policies
* API token rotation
* SSO
* Compliance workflows
* Workspace isolation

---

## 4. OpenAI-Compatible APIs

All models exposed through a unified interface.

The frontend should never care whether backend model is:

* OpenAI
* Anthropic
* DeepSeek
* Gemini
* Groq
* Ollama
* Workers AI

---

## 5. Workspace Persistence

Containers are ephemeral.

Developer intent is not.

Persistent storage is mandatory.

---

# High-Level Architecture

```text
+------------------------------------------------+
| Browser UI                                     |
| React / Next.js                                |
+------------------------------------------------+
                |
                v
+------------------------------------------------+
| Cloudflare Edge                                |
| Workers + Durable Objects                      |
+------------------------------------------------+
                |
                v
+------------------------------------------------+
| Cloudflare Containers                          |
| Isolated developer workspaces                  |
+------------------------------------------------+
                |
                +-------------------------------+
                |                               |
                v                               v
+---------------------------+   +---------------------------+
| Persistent Volumes        |   | AI Gateway               |
| Workspace storage         |   | OpenAI-compatible APIs   |
+---------------------------+   +---------------------------+
                                                |
                                                v
                           +--------------------------------+
                           | Model Providers                |
                           | OpenAI                         |
                           | Anthropic                      |
                           | DeepSeek                       |
                           | Gemini                         |
                           | Groq                           |
                           +--------------------------------+
```

---

# Technology Stack

## Frontend

* Next.js
* React
* TailwindCSS
* Monaco Editor
* xterm.js
* Zustand or Redux
* WebSockets

---

## Backend

* Cloudflare Workers
* Durable Objects
* Cloudflare Containers
* R2
* D1
* KV

---

## AI Integration

* Cloudflare AI Gateway
* OpenAI-compatible APIs

---

## Authentication

* Cloudflare Access
* GitHub OAuth
* Google OAuth
* Enterprise SAML/OIDC

---

## Storage

* Persistent mounted volume
* R2 for snapshots/backups

---

# Deployment Experience

## Primary UX Goal

A user should be able to:

1. Click Deploy
2. Login to Cloudflare
3. Configure workspace
4. Add API key
5. Wait 2-5 minutes
6. Start coding

That is the entire journey.

---

# Installation Wizard

## Required Inputs

### 1. Workspace Name

Examples:

* engineering-lab
* ai-sandbox
* clinebox-dev

---

### 2. Container Size

Options:

| Tier   | CPU    | RAM   | Disk   |
| ------ | ------ | ----- | ------ |
| Small  | 2 vCPU | 4 GB  | 20 GB  |
| Medium | 4 vCPU | 8 GB  | 50 GB  |
| Large  | 8 vCPU | 16 GB | 100 GB |

---

### 3. Default Model

Preselected default:

* DeepSeek V4 Flash

Selectable models:

* DeepSeek V4 Flash
* DeepSeek V4 Pro
* OpenAI GPT-4.1
* OpenAI GPT-4o
* Claude Sonnet 4
* Gemini 2.5 Pro
* Qwen Coder
* Llama 4 Maverick
* DeepSeek R1

---

### 4. API Keys

Optional:

* OpenAI
* Anthropic
* DeepSeek
* Google
* Groq

All keys encrypted.

---

### 5. GitHub Integration

Capabilities:

* OAuth login
* SSH key generation
* Repository cloning
* Automatic git config
* Push/pull support

---

### 6. Domain Binding

Optional custom domain support.

Examples:

* ide.company.com
* ai-dev.internal

---

### 7. Persistent Storage

Options:

* Local persistent volume
* R2 backup snapshots

---

### 8. Enterprise Options

Optional:

* SSO
* Access policies
* Audit logging
* Approved model list
* Cost controls

---

# Workspace Features

## Browser IDE

Capabilities:

* Monaco editor
* Multi-tab editing
* File explorer
* Git status
* Search
* Diff viewer
* Markdown preview

---

## Terminal

Requirements:

* Full xterm.js support
* Multiple terminals
* Persistent shell sessions
* SSH compatibility
* Clipboard support

---

## AI Chat Panel

Features:

* Streaming responses
* Tool calling
* File context
* Multi-file edits
* Model switching
* Token usage tracking
* Retry support
* Diff preview

---

## Kanban Integration

Inspired by:

* [https://github.com/cline/kanban](https://github.com/cline/kanban)

Capabilities:

* AI task planning
* Agent execution tracking
* Task decomposition
* Prompt history
* Session recovery
* Workspace memory

---

# AI Gateway Architecture

All inference traffic flows through Cloudflare AI Gateway.

Example endpoint:

```text
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai
```

The backend must:

* Proxy requests
* Inject auth securely
* Enforce quotas
* Enforce model policy
* Record telemetry
* Support retries

---

# Model Layer

## Default Model

DeepSeek V4 Flash

Reasons:

* Fast interaction loop
* Lower latency
* Lower operational cost
* Better coding iteration velocity
* Better default UX

---

## Premium Models

### DeepSeek V4 Pro

Used for:

* Architecture
* Large refactors
* Long reasoning
* Planning

---

## Other Supported Models

* GPT-4.1
* GPT-4o
* Claude Sonnet 4
* Gemini 2.5 Pro
* Qwen Coder
* DeepSeek R1
* Llama 4 Maverick

---

# Model Registry

```ts
export type ModelDefinition = {
  id: string
  name: string
  provider: string
  supportsTools: boolean
  supportsStreaming: boolean
  contextWindow: number
  defaultTemperature: number
  enabled: boolean
  recommendedFor: string[]
}
```

Example:

```ts
[
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    provider: "deepseek",
    supportsTools: true,
    supportsStreaming: true,
    contextWindow: 128000,
    defaultTemperature: 0.2,
    enabled: true,
    recommendedFor: [
      "coding",
      "rapid-iteration",
      "agentic-workflows"
    ]
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    provider: "deepseek",
    supportsTools: true,
    supportsStreaming: true,
    contextWindow: 128000,
    defaultTemperature: 0.2,
    enabled: true,
    recommendedFor: [
      "architecture",
      "reasoning",
      "planning"
    ]
  }
]
```

---

# Enterprise Requirements

## Authentication

Required:

* GitHub OAuth
* Google OAuth
* Cloudflare Access

Enterprise:

* Okta
* Azure AD
* SAML
* OIDC

---

## RBAC

Roles:

* Admin
* Platform Admin
* Developer
* Read-only
* Auditor

---

## Audit Logging

Log:

* Prompt usage
* File operations
* Git operations
* Model invocations
* Admin changes
* Auth events

Exportable to:

* Splunk
* Datadog
* SIEM
* Elastic

---

## Cost Controls

Capabilities:

* Per-user quotas
* Per-team quotas
* Daily token limits
* Model restrictions
* Budget ceilings
* Workspace shutdown policies

---

## Security

Requirements:

* Secrets encryption
* Isolated containers
* CSP headers
* Rate limiting
* Egress restrictions
* AI Gateway-only outbound model access
* Signed sessions
* JWT validation

---

# Workspace Runtime

## Container Image

Base image:

* Ubuntu LTS

Preinstalled:

* Git
* Node.js
* Bun
* Python
* Docker CLI
* Podman
* jq
* ripgrep
* fd
* tmux
* zsh

Optional:

* Go
* Rust
* Zig
* Java
* CUDA tooling

---

# Persistence Strategy

## Persistent Volumes

Persist:

* Source code
* Git repos
* SSH keys
* Workspace state
* Prompt history
* Terminal history

---

## Snapshots

Support:

* Manual snapshots
* Scheduled snapshots
* Restore workflows
* Export/import

---

# GitHub Integration

## Features

* Repository clone
* SSH key generation
* PR creation
* Commit signing
* Branch switching
* Git status
* Webhook integration

---

# SSH Access

Users must be able to:

* SSH directly into workspace
* Use VSCode Remote SSH
* Use local terminal workflows

---

# Observability

## Metrics

Track:

* Container startup time
* AI latency
* Token usage
* Workspace uptime
* Active users
* Storage usage
* Model spend

---

## Logging

Collect:

* Worker logs
* Container logs
* Terminal logs
* API logs
* AI request logs

---

# Admin Dashboard

Capabilities:

* Active workspaces
* Spend monitoring
* User management
* Model governance
* Audit log browsing
* Workspace termination
* Snapshot management

---

# UX Requirements

## Model Badges

Supported badges:

* FAST
* REASONING
* PREMIUM
* APPROVED
* DEFAULT

DeepSeek V4 Flash should appear as:

* DEFAULT
* FAST
* Recommended for Coding

---

# API Design

## Backend APIs

### Workspace APIs

```text
POST   /api/workspaces
GET    /api/workspaces
GET    /api/workspaces/:id
DELETE /api/workspaces/:id
```

---

### Model APIs

```text
GET /api/models
POST /api/chat
```

---

### Git APIs

```text
POST /api/git/clone
POST /api/git/push
POST /api/git/pull
```

---

# Deployment Infrastructure

## Infrastructure Components

Required:

* Cloudflare Workers
* Cloudflare Containers
* AI Gateway
* Durable Objects
* D1
* R2
* KV

---

# CI/CD

## GitHub Actions

Required pipelines:

* Lint
* Typecheck
* Build
* Security scan
* Container build
* Deploy

---

# Monorepo Structure

```text
/apps
  /web
  /api
  /worker
/packages
  /ui
  /sdk
  /gateway
  /auth
  /models
/infrastructure
/docs
```

---

# Future Roadmap

## Phase 2

* Multi-user collaboration
* Shared terminals
* Pair programming
* GPU-backed workspaces
* Private model hosting
* Ollama integration
* Workers AI integration

---

## Phase 3

* Enterprise marketplace
* Workspace templates
* AI-generated environments
* Policy-as-code
* Autonomous coding agents
* Distributed execution

---

# Non-Goals

The platform is NOT:

* Kubernetes management software
* Generic VDI software
* Traditional IDE replacement
* GPU training platform
* CI/CD replacement

---

# Success Metrics

## Technical

* Workspace startup under 120 seconds
* AI response latency under 2 seconds for streaming start
* 99.9% uptime
* Zero direct provider credential exposure

---

## Product

* Deploy-to-code under 5 minutes
* 80% weekly active retention
* Multi-session persistence
* Enterprise pilot adoption

---

# Product Philosophy

Fast systems change behavior.

An AI coding platform is not merely an editor.

It becomes a developer operating system.

If the latency is low enough, the friction disappears.

When friction disappears:

* experimentation rises
* iteration rises
* shipping rises

The goal is not to impress developers.

The goal is to remove waiting from the act of building.
