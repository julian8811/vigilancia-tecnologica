import crypto from 'crypto'
import type { NormalizedRecord, ArticleRecord } from '@vt/types'

export function mapCrossrefToNormalized(item: any): NormalizedRecord {
  const sourceIds: Record<string, string> = {}
  if (item.DOI) sourceIds.doi = item.DOI
  if (item.URL) sourceIds.url = item.URL

  const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Sin título'
  const year =
    item.published?.['date-parts']?.[0]?.[0] ||
    item['published-print']?.['date-parts']?.[0]?.[0] ||
    item['published-online']?.['date-parts']?.[0]?.[0] ||
    undefined

  const normalized: ArticleRecord = {
    id: item.DOI || item.URL,
    title,
    abstract: item.abstract?.replace(/<[^>]+>/g, '') || undefined,
    year,
    doi: sourceIds.doi,
    journal: item['container-title']?.[0] || undefined,
    authors: (item.author || []).map((a: any) => ({
      name: [a.given, a.family].filter(Boolean).join(' ') || 'Desconocido',
      affiliation: a.affiliation?.[0]?.name || undefined,
    })),
    citationCount: item['is-referenced-by-count'] || 0,
    isOpenAccess: false,
    url: item.URL || undefined,
    sourceIds,
  }

  const dedupInput = sourceIds.doi || title
  const dedupHash = crypto.createHash('sha256').update(dedupInput).digest('hex').slice(0, 16)

  return {
    id: item.DOI || item.URL || crypto.randomUUID(),
    type: 'article',
    title: normalized.title,
    abstract: normalized.abstract,
    year: normalized.year,
    country: undefined,
    language: item.language || undefined,
    sourceIds,
    dedupHash,
    relevanceScore: item.score || undefined,
    isOpenAccess: false,
    citationCount: normalized.citationCount,
    raw: item,
    normalized,
  }
}
