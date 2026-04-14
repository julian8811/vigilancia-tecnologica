# Design: Phase 1 - Tests + Error Handling

## Technical Approach

Add test infrastructure using vitest + react-testing-library, then add error boundaries and structured error handling across all layers (UI, API, workers).

## Architecture Decisions

### Decision: Test Framework

**Choice**: vitest with @testing-library/react
**Alternatives considered**: Jest (default but older), Playwright (too heavy for unit)
**Rationale**: Modern, fast, compatible with existing React testing patterns, works with TypeScript

### Decision: Error Boundary Strategy

**Choice**: Per-route Error Boundaries with global fallback
**Alternatives considered**: Single global only (too coarse), per-component (too granular)
**Rationale**: Matches Next.js App Router pattern - one per route segment

### Decision: Toast Library

**Choice**: sonner (https://sonner.emilkowalski.ski)
**Alternatives considered**: react-hot-toast (older), custom (too much work)
**Rationale**: Lightweight, accessible, works well with Server Components

## Data Flow

```
User Action → TRPC Router → try/catch → 
  ├─ Success → sonner.success() → redirect
  └─ Failure → sonner.error() → show error
```

```
Worker Error → BullMQ → 
  ├─ Retry < 3 → retry queue
  └─ Retry >= 3 → dead letter queue
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `vitest.config.ts` | Create | Vitest configuration |
| `apps/web/vitest.config.ts` | Create | Web specific config with coverage |
| `packages/sources/src/**/*.test.ts` | Create | Unit tests for mappers |
| `lib/search/query-parser.test.ts` | Create | Query parser tests |
| `server/routers/*.test.ts` | Create | Router input validation tests |
| `components/error-boundary.tsx` | Create | Reusable error boundary |
| `app/(app)/error.tsx` | Create | Route-level error UI |
| `app/global-error.tsx` | Create | Root error handler |
| `lib/error/toast.ts` | Create | Toast helpers |
| `app/api/trpc/[trpc]/route.ts` | Modify | Add error handling wrapper |

## Interfaces

```typescript
// Toast helper
export function showSuccess(message: string): void
export function showError(message: string): void

// Error boundary
interface ErrorBoundaryProps {
  fallback: React.ReactNode
  children: React.ReactNode
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | query-parser, mappers | vitest with describe/it |
| Integration | router input validation | vitest + supertest pattern |
| E2E | error flows | Playwright |

## Migration / Rollback

- Feature flag: `ENABLE_ERROR_BOUNDARIES`
- Can disable via env var to rollback
- Tests can be removed (not breaking)

## Open Questions

- [ ] Sentry integration - is paid plan required? Consider pino + console for MVP
- [ ] Coverage target - 60% is achievable? Start with 40%, increment per release