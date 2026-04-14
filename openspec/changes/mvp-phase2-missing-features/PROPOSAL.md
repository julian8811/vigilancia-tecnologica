# Proposal: Phase 2 - Missing Features

## Intent
Implement critical features missing for MVP functionality: password reset, dashboard stats, exports, and complete reports.

## Scope
- Password reset flow via Clerk
- Dashboard with real stats (projects, records, alerts)
- CSV/Excel export functionality
- Complete PDF reports generation
- Project delete functionality
- Error states in all UI pages

## Approach
1. Enable Clerk password reset (handled by Clerk, need to verify UI)
2. Add aggregated stats queries in analytics router
3. Add export router for CSV/Excel generation
4. Complete report PDF generation with @react-pdf
5. Add soft delete for projects with confirmation
6. Add empty/error states in all pages

## Rollback Plan
- Remove export routes
- Disable project delete (set to archived only)

## Risks
- PDF generation may be slow for large datasets
- Export may timeout for large result sets (need pagination)

## Dependencies
- Phase 1 (tests + error handling)

## Success Criteria
- Users can reset password
- Dashboard shows real metrics
- Users can export results to CSV
- PDFs generate correctly
- Projects can be archived/deleted