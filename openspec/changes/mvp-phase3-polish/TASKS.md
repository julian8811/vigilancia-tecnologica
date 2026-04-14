# Tasks: Phase 3 - Polish for Production

## Phase 1: CI/CD Pipeline

- [ ] 1.1 Create `.github/workflows/ci.yml` (test, lint, build)
- [ ] 1.2 Add turbo caching to workflow
- [ ] 1.3 Create `.github/workflows/deploy.yml` (staging)
- [ ] 1.4 Add environment configs (dev, staging, prod)
- [ ] 1.5 Test workflow locally
- [ ] 1.6 Verify CI passes on PR

## Phase 2: Structured Logging

- [ ] 2.1 Install pino (`pnpm add pino pino-pretty`)
- [ ] 2.2 Create `lib/logger.ts`
- [ ] 2.3 Replace console.log in server code
- [ ] 2.4 Add logging middleware to TRPC
- [ ] 2.5 Verify JSON logs in production

## Phase 3: Rate Limiting

- [ ] 3.1 Install rate limiter (`pnpm add rate-limiter`)
- [ ] 3.2 Create `lib/rate-limit.ts`
- [ ] 3.3 Add rate limit middleware to `server/trpc.ts`
- [ ] 3.4 Configure limits (100 req/min default)
- [ ] 3.5 Test rate limit triggers

## Phase 4: Mobile Responsive

- [ ] 4.1 Audit current breakpoints in tailwind.config.ts
- [ ] 4.2 Fix sidebar to collapse on mobile
- [ ] 4.3 Fix tables to scroll horizontally on mobile
- [ ] 4.4 Fix forms to stack vertically
- [ ] 4.5 Add touch-friendly targets (44px min)
- [ ] 4.6 Test on actual mobile devices

## Phase 5: Environment Config

- [ ] 5.1 Create `.env.production.example`
- [ ] 5.2 Add environment detection code
- [ ] 5.3 Update Docker configs for prod
- [ ] 5.4 Verify staging works

## Phase 6: Verification

- [ ] 6.1 Run CI workflow - passes
- [ ] 6.2 Check structured logs
- [ ] 6.3 Test rate limiting blocks excess
- [ ] 6.4 Verify mobile responsive works
- [ ] 6.5 Verify production config works