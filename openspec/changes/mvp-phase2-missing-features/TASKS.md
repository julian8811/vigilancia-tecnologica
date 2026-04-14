# Tasks: Phase 2 - Missing Features

## Phase 1: Authentication

- [ ] 1.1 Verify Clerk sign-in pages have password reset link
- [ ] 1.2 Add link to security settings in `app/(app)/settings/page.tsx`
- [ ] 1.3 Create `app/(app)/settings/security/page.tsx` (if missing)
- [ ] 1.4 Test password reset flow end-to-end

## Phase 2: Dashboard Stats

- [ ] 2.1 Add stats aggregation to `server/routers/workspace.ts`
- [ ] 2.2 Add Redis cache setup (pico cached for 5 min)
- [ ] 2.3 Update `app/(app)/dashboard/page.tsx` to call stats API
- [ ] 2.4 Add dashboard stats components
- [ ] 2.5 Add charts (use existing Recharts or similar)

## Phase 3: Export

- [ ] 3.1 Install exceljs (`pnpm add exceljs`)
- [ ] 3.2 Create `server/routers/export.ts` (CSV/Excel router)
- [ ] 3.3 Create `app/api/export/[projectId]/route.ts`
- [ ] 3.4 Add export button to results page UI
- [ ] 3.5 Handle large exports (streaming, pagination)

## Phase 4: Reports

- [ ] 4.1 Create PDF templates in `lib/reports/templates/`
- [ ] 4.2 Create `lib/reports/templates/technical.tsx`
- [ ] 4.3 Create `lib/reports/templates/executive.tsx`
- [ ] 4.4 Create `lib/reports/templates/ficha-tecnica.tsx`
- [ ] 4.5 Update `server/routers/reports.ts` for PDF generation
- [ ] 4.6 Add download endpoint in `app/api/reports/[id]/download/`

## Phase 5: Project Delete

- [ ] 5.1 Add soft delete to `server/routers/projects.ts`
- [ ] 5.2 Add confirmation dialog to project UI
- [ ] 5.3 Add "Archived" status filter

## Phase 6: Verification

- [ ] 6.1 Test password reset flow
- [ ] 6.2 Verify dashboard shows real stats
- [ ] 6.3 Test CSV export
- [ ] 6.4 Test PDF generation
- [ ] 6.5 Test project delete