import crypto from 'crypto'
import type { NormalizedRecord, ArticleRecord } from '@vt/types'

export function mapOpenAlexToNormalized(work: any): NormalizedRecord {
  const sourceIds: Record<string, string> = {}
  if (work.doi) sourceIds.doi = work.doi.replace('https://doi.org/', '')
  if (work.id) sourceIds.openalex = work.id.replace('https://openalex.org/', '')

  const normalized: ArticleRecord = {
    id: work.id,
    title: work.title || 'Sin título',
    abstract: work.abstract || undefined,
    year: work.publication_year || undefined,
    doi: sourceIds.doi,
    journal: work.primary_location?.source?.display_name || undefined,
    authors: (work.authorships || []).map((a: any) => ({
      name: a.author?.display_name || 'Desconocido',
      affiliation: a.institutions?.[0]?.display_name || undefined,
    })),
    citationCount: work.cited_by_count || 0,
    isOpenAccess: work.open_access?.is_oa || false,
    url: work.primary_location?.landing_page_url || undefined,
    sourceIds,
  }

  const dedupInput = sourceIds.doi || sourceIds.openalex || work.title || ''
  const dedupHash = crypto.createHash('sha256').update(dedupInput).digest('hex').slice(0, 16)

  return {
    id: work.id,
    type: 'article',
    title: normalized.title,
    abstract: normalized.abstract,
    year: normalized.year,
    country: work.authorships?.[0]?.institutions?.[0]?.country_code || undefined,
    language: work.language || undefined,
    sourceIds,
    dedupHash,
    relevanceScore: work.relevance_score || undefined,
    isOpenAccess: normalized.isOpenAccess,
    citationCount: normalized.citationCount,
    raw: work,
    normalized,
  }
}
