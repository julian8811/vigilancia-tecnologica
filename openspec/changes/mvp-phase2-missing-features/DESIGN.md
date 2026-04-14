# Design: Phase 2 - Missing Features

## Technical Approach

Implement password reset (already supported by Clerk UI), dashboard stats aggregation, CSV export endpoint, and complete PDF generation.

## Architecture Decisions

### Decision: Dashboard Stats

**Choice**: Real-time aggregation with Redis cache (5 min TTL)
**Alternatives considered**: Static daily (stale), Real-time without cache (expensive)
**Rationale**: Dashboard needs freshness but can't hit DB every render

### Decision: Export Strategy

**Choice**: Server-side streaming with pagination (100 records/batch)
**Alternatives considered**: Client-side (timeout for large), Web Workers (complex)
**Rationale**: Reliable for large exports, use streaming to avoid memory issues

### Decision: PDF Generation

**Choice**: @react-pdf with templates (already installed)
**Alternatives considered**: Puppeteer (heavy), HTML-to-PDF (issues with complex layouts)
**Rationale**: Already in dependencies, gives precise control over layout

## Data Flow

```
Dashboard:
  API Request → Router → Aggregate Query → Redis Cache (hit?) → DB Query → Cache → Response
```

```
Export:
  Select "Export" → API call (search params) → Worker Job → Stream CSV → Download
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/routers/workspace.ts` | Modify | Add stats aggregation |
| `server/routers/export.ts` | Create | CSV/Excel export router |
| `app/api/export/search/route.ts` | Create | Export endpoint |
| `lib/reports/templates/*.tsx` | Create | PDF templates |
| `app/(app)/settings/page.tsx` | Modify | Add password reset link |
| `app/(app)/settings/security/page.tsx` | Create | Security settings |

## Interfaces

```typescript
// Export router
export interface ExportInput {
  projectId: string
  format: 'csv' | 'xlsx'
  fields: string[]
  filters?: SearchFilters
}

// Dashboard stats
export interface WorkspaceStats {
  projects: number
  records: number
  searches: number
  alerts: number
  lastActivity: Date | null
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Stats aggregation | vitest |
| Integration | Export endpoint | supertest pattern |
| E2E | Full export flow | Playwright |

## Migration / Rollback

- No migration needed
- Can disable export in UI config
- PDF templates can be disabled

## Open Questions

- [ ] Excel export - need xlsx library? Use exceljs or write自制
- [ ] Dashboard cache key - what invalidates? Activity count increments