# Tasks: Phase 1 - Tests + Error Handling

## Phase 1: Infrastructure

- [ ] 1.1 Add vitest to `package.json` root (vitest, @vitest/ui)
- [ ] 1.2 Add vitest to `@vt/web` package (vitest, @testing-library/react, jsdom)
- [ ] 1.3 Add vitest to `@vt/sources` package
- [ ] 1.4 Create `vitest.config.ts` in root with coverage threshold 60%
- [ ] 1.5 Create `apps/web/vitest.config.ts` with Web test setup
- [ ] 1.6 Add test script to root `package.json`

## Phase 2: Testing Implementation

- [ ] 2.1 Create `packages/sources/src/openalex/mapper.test.ts` (if not exists)
- [ ] 2.2 Create `packages/sources/src/crossref/mapper.test.ts`
- [ ] 2.3 Create `packages/sources/src/patentsview/mapper.test.ts`
- [ ] 2.4 Create `packages/sources/src/lens/mapper.test.ts`
- [ ] 2.5 Create `lib/search/query-parser.test.ts`
- [ ] 2.6 Create `server/routers/projects.test.ts` (input validation)
- [ ] 2.7 Create `server/routers/search.test.ts` (input validation)

## Phase 3: Error Handling

- [ ] 3.1 Install sonner (`pnpm add sonner`)
- [ ] 3.2 Create `components/error-boundary.tsx`
- [ ] 3.3 Create `app/global-error.tsx` (root error handler)
- [ ] 3.4 Create `app/(app)/error.tsx` (route error UI)
- [ ] 3.5 Create `lib/error/toast.ts` (toast helpers)
- [ ] 3.6 Add error wrapper to `app/api/trpc/[trpc]/route.ts`

## Phase 4: Worker Error Handling

- [ ] 4.1 Configure BullMQ dead letter queue in `apps/workers/src/index.ts`
- [ ] 4.2 Add error logging in `apps/workers/src/workers/ingestion/base.worker.ts`

## Phase 5: Verification

- [ ] 5.1 Run `pnpm test` - all tests pass
- [ ] 5.2 Check coverage report - 60%+ threshold
- [ ] 5.3 Verify error boundary triggers on crash
- [ ] 5.4 Verify toast shows on error