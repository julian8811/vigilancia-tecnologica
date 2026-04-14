# Vigilancia Tecnológica - Deployment Guide

## Quick Start

### 1. Vercel (Frontend + API)

```bash
# Conectar repo a Vercel
npx vercel link
npx vercel --prod

# O manualmente:
# 1. Ir a vercel.com > Add New > Project
# 2. Importar desde GitHub
# 3. Configurar variables de entorno (ver abajo)
# 4. Deploy automático
```

### 2. Railway (Workers)

```bash
# Conectar repo a Railway
railway link
railway up

# O manualmente:
# 1. Ir a railway.app > New Project
# 2. Connect GitHub repository
# 3. Configurar variables de entorno
# 4. Deploy automático
```

---

## Environment Variables

### Vercel (Obligatorias)

| Variable | Descripción | Cómo obtener |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | Railway/Supabase/Neon |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (pk_live_xxx) | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk secret key (sk_live_xxx) | Clerk Dashboard |
| `NEXT_PUBLIC_APP_URL` | URL pública | `https://tu-app.vercel.app` |

### Vercel (Opcionales)

| Variable | Descripción |
|----------|-------------|
| `CLERK_WEBHOOK_SECRET` | Webhook verification |
| `OPENAI_API_KEY` | Para resúmenes IA |
| `ANTHROPIC_API_KEY` | Para resúmenes IA |
| `RESEND_API_KEY` | Para emails |
| `SENTRY_DSN` | Error tracking |

### Railway (Workers)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL (misma que Vercel) |
| `REDIS_URL` | Redis para BullMQ |
| `MEILISEARCH_URL` | Motor de búsqueda |
| `MEILISEARCH_MASTER_KEY` | Key de Meilisearch |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Next.js 14 (App Router)                │   │
│  │   - Server Components                           │   │
│  │   - tRPC API (/api/trpc/*)                     │   │
│  │   - Webhooks (/api/webhooks/clerk)              │   │
│  │   - Auth middleware (Clerk)                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   RAILWAY                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │           BullMQ Workers                        │   │
│  │   - Ingestion workers (OpenAlex, Crossref...) │   │
│  │   - Normalization worker                       │   │
│  │   - AI enrichment worker                      │   │
│  │   - Alert worker                               │   │
│  │   - Report generation worker                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                      │                │
         ▼                      ▼                ▼
   PostgreSQL              Redis            Meilisearch
   (Datos)                (Queues)          (Búsqueda)
```

---

## Troubleshooting

### Build Failures

1. **Prisma client not generated**
   - Verify `vercel.json` has: `"buildCommand": "pnpm --filter @vt/database db:generate && pnpm --filter @vt/web build"`

2. **Module not found: @vt/database**
   - Ensure pnpm workspace is working: `pnpm install`
   - Check `pnpm-workspace.yaml` has correct paths

### Runtime Errors

1. **DATABASE_URL not configured**
   - Add to Vercel Environment Variables
   - Format: `postgresql://user:pass@host:port/db`

2. **Clerk authentication not working**
   - Ensure using `pk_live_xxx` and `sk_live_xxx` (not test keys)
   - Verify `NEXT_PUBLIC_APP_URL` matches Vercel URL

3. **Middleware errors**
   - Check Clerk Dashboard > Webhooks > URL is correct
   - Verify `CLERK_WEBHOOK_SECRET` is set

---

## Scripts

```bash
# Development
pnpm dev                    # Start all apps
pnpm --filter @vt/web dev   # Only web
pnpm --filter @vt/workers dev  # Only workers

# Build
pnpm build                 # Build all
pnpm --filter @vt/web build

# Database
pnpm --filter @vt/database db:generate
pnpm --filter @vt/database db:migrate
pnpm --filter @vt/database db:studio

# Tests
pnpm test
pnpm --filter @vt/web test
```

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC, Prisma, PostgreSQL
- **Auth**: Clerk
- **Workers**: BullMQ, Redis
- **Search**: Meilisearch
- **Deployment**: Vercel (web/API), Railway (workers)