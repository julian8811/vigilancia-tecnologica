import crypto from 'crypto'
import type { NormalizedRecord, PatentRecord } from '@vt/types'

export function mapPatentsViewToNormalized(patent: any): NormalizedRecord {
  const sourceIds: Record<string, string> = {}
  if (patent.patent_number) sourceIds.patentNumber = patent.patent_number
  if (patent.patent_id) sourceIds.patentsview = patent.patent_id

  const inventors: Array<{ name: string; role: 'inventor' }> = []
  const rawInventors = Array.isArray(patent.inventors) ? patent.inventors : patent.inventors ? [patent.inventors] : []
  for (const inv of rawInventors) {
    const name = [inv.inventor_first_name, inv.inventor_last_name].filter(Boolean).join(' ')
    if (name) inventors.push({ name, role: 'inventor' })
  }

  const normalized: PatentRecord = {
    id: patent.patent_id,
    title: patent.patent_title || 'Sin título',
    abstract: patent.patent_abstract || undefined,
    year: patent.patent_year ? parseInt(patent.patent_year) : undefined,
    publicationNumber: patent.patent_number || undefined,
    jurisdiction: 'US',
    legalStatus: 'granted',
    ipcCodes: patent.ipc_main_group ? [patent.ipc_main_group] : [],
    authors: inventors,
    publicationDate: patent.patent_date || undefined,
    sourceIds,
  }

  const dedupInput = patent.patent_number || patent.patent_id || patent.patent_title || ''
  const dedupHash = crypto.createHash('sha256').update(dedupInput).digest('hex').slice(0, 16)

  return {
    id: patent.patent_id || crypto.randomUUID(),
    type: 'patent',
    title: normalized.title,
    abstract: normalized.abstract,
    year: normalized.year,
    country: 'US',
    language: 'en',
    sourceIds,
    dedupHash,
    isOpenAccess: false,
    citationCount: 0,
    raw: patent,
    normalized,
  }
}
