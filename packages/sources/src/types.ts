import type { NormalizedRecord } from '@vt/types'

export interface FetchOptions {
  query: string
  maxResults?: number
  fromDate?: string
  toDate?: string
  filters?: Record<string, unknown>
}

export interface SourceResult {
  records: NormalizedRecord[]
  total: number
  source: string
  fetchedAt: Date
}

export interface RateLimit {
  requestsPerSecond: number
  requestsPerDay?: number
}

export interface SourceClient {
  name: string
  rateLimit: RateLimit
  fetch(options: FetchOptions): Promise<SourceResult>
}
