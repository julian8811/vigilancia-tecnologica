import crypto from 'crypto'
import type { NormalizedRecord, PatentRecord } from '@vt/types'

export function mapLensToNormalized(patent: any): NormalizedRecord {
  const sourceIds: Record<string, string> = {}
  if (patent.lens_id) sourceIds.lens = patent.lens_id
  if (patent.publication_number) sourceIds.publicationNumber = patent.publication_number

  const normalized: PatentRecord = {
    id: patent.lens_id,
    title: patent.title || 'Sin título',
    abstract: patent.abstract || undefined,
    year: patent.year_published || undefined,
    publicationNumber: patent.publication_number || undefined,
    jurisdiction: patent.jurisdiction || undefined,
    legalStatus: patent.legal_status || undefined,
    ipcCodes:
      patent.ipc_classifications?.map((c: any) => c.symbol || String(c)).filter(Boolean) || [],
    authors: [
      ...(patent.inventor || []).map((a: any) => ({ name: a.name || String(a), role: 'inventor' as const })),
      ...(patent.applicant || []).map((a: any) => ({ name: a.name || String(a), role: 'applicant' as const })),
    ],
    filingDate: patent.filing_date || undefined,
    publicationDate: patent.date_published || undefined,
    sourceIds,
  }

  const dedupInput = patent.publication_number || patent.lens_id || patent.title || ''
  const dedupHash = crypto.createHash('sha256').update(dedupInput).digest('hex').slice(0, 16)

  return {
    id: patent.lens_id || crypto.randomUUID(),
    type: 'patent',
    title: normalized.title,
    abstract: normalized.abstract,
    year: normalized.year,
    country: patent.jurisdiction || undefined,
    language: undefined,
    sourceIds,
    dedupHash,
    relevanceScore: patent._score || undefined,
    isOpenAccess: false,
    citationCount: 0,
    raw: patent,
    normalized,
  }
}
