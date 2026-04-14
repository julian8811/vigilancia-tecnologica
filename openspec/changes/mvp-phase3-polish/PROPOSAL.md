# Proposal: Phase 3 - Polish for Production

## Intent
Add production readiness infrastructure: CI/CD, logging, rate limiting, and mobile responsiveness.

## Scope
- CI/CD pipeline (GitHub Actions)
- Structured logging (Winston/Pino)
- Rate limiting (in TRPC)
- Mobile responsive design audit
- Environment-specific configurations (dev/staging/prod)

## Approach
1. Create GitHub Actions workflow for test + build
2. Add structured logging middleware
3. Add tRPC rate limiting with @t-rpc/rate-limit
4. Audit all pages for mobile responsiveness
5. Add .env.production template

## Rollback Plan
- Remove CI/CD workflow file
- Remove rate limiting middleware

## Risks
- Rate limiting may block legitimate high-usage users
- CI/CD may fail on first runs (need adjustments)

## Dependencies
- Phase 1 + Phase 2 completed

## Success Criteria
- CI/CD passes on main branch
- Structured logs in production
- API rate limited appropriately
- All pages work on mobile