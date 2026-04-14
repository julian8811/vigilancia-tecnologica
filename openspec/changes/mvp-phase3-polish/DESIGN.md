# Design: Phase 3 - Polish for Production

## Technical Approach

Add CI/CD via GitHub Actions, structured logging with pino, rate limiting in tRPC, and mobile responsive audit with Tailwind breakpoints.

## Architecture Decisions

### Decision: CI/CD Pipeline

**Choice**: GitHub Actions with turbo build caching
**Alternatives considered**: Vercel CLI (limited), Manual deploy (not scalable)
**Rationale**: Already on GitHub, native caching support, free tier works

### Decision: Logging Library

**Choice**: pino (pino.pretty for dev, JSON for prod)
**Alternatives considered**: Winston (verbose), console.log (no structure)
**Rationale**: Fast, JSON by default, low overhead

### Decision: Rate Limiting

**Choice**: In-memory with tRPC middleware (shared by process)
**Alternatives considered**: Redis (external dependency), Third-party (expensive)
**Rationale**: For MVP - works for single instance, add Redis when scaling

## Data Flow

```
CI/CD:
  Push → PR Check → Test → Build → Deploy Staging → (manual) Deploy Prod
```

```
Rate Limit:
  Request → Check in-memory map → 
  ├─ Under limit → Process
  └─ Over limit → 429 Response
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | Create | Test + build workflow |
| `.github/workflows/deploy.yml` | Create | Deploy workflow |
| `lib/logger.ts` | Create | Pino logger |
| `server/routers/_app.ts` | Modify | Add rate limiting |
| `tailwind.config.ts` | Modify | Add mobile breakpoints |
| `app/globals.css` | Modify | Add responsive utilities |

## Interfaces

```typescript
// Logger
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'production' ? undefined : {
    target: 'pino-pretty'
  }
})

// Rate limiter
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Rate limit logic | vitest |
| Integration | CI workflow | Run locally first |
| E2E | Mobile responsive | Manual test |

## Migration / Rollback

- Can disable CI workflow
- Rate limiting can be disabled via env var
- Mobile responsive is CSS only - safe to test

## Open Questions

- [ ] Redis for rate limit - single instance now, need Redis when scaling?
- [ ] Which environments? Dev → Staging → Prod
- [ ] Mobile responsive - need device lab for testing?