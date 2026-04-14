import axios from 'axios'
import { mapCrossrefToNormalized } from './mapper'
import type { SourceClient, FetchOptions, SourceResult } from '../types'

const BASE_URL = 'https://api.crossref.org'
const POLITE_EMAIL = process.env.CROSSREF_EMAIL || 'research@vigilanciatecnologica.com'

export class CrossrefClient implements SourceClient {
  name = 'crossref'
  rateLimit = { requestsPerSecond: 5, requestsPerDay: 50000 }

  async fetch(options: FetchOptions): Promise<SourceResult> {
    const rows = Math.min(options.maxResults || 100, 1000)
    const params: Record<string, string> = {
      query: options.query,
      rows: String(rows),
      mailto: POLITE_EMAIL,
    }

    if (options.fromDate) params['filter'] = `from-pub-date:${options.fromDate}`

    const response = await axios.get(`${BASE_URL}/works`, { params })
    const items = response.data?.message?.items || []

    return {
      records: items.map(mapCrossrefToNormalized),
      total: items.length,
      source: 'crossref',
      fetchedAt: new Date(),
    }
  }
}
