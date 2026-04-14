export interface ArticleRecord {
  id: string
  title: string
  abstract?: string
  year?: number
  doi?: string
  journal?: string
  authors: Array<{ name: string; affiliation?: string }>
  citationCount?: number
  isOpenAccess?: boolean
  url?: string
  sourceIds: Record<string, string>
}

export interface PatentRecord {
  id: string
  title: string
  abstract?: string
  year?: number
  publicationNumber?: string
  jurisdiction?: string
  legalStatus?: string
  ipcCodes: string[]
  authors: Array<{ name: string; role: string }>
  filingDate?: string
  publicationDate?: string
  sourceIds: Record<string, string>
}

export type NormalizedRecord = {
  id: string
  type: 'article' | 'patent'
  title: string
  abstract?: string
  year?: number
  country?: string
  language?: string
  sourceIds: Record<string, string>
  dedupHash: string
  relevanceScore?: number
  isOpenAccess?: boolean
  citationCount?: number
  raw: unknown
  normalized: ArticleRecord | PatentRecord
}
