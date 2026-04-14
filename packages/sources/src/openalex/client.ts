import axios from 'axios'
import { mapOpenAlexToNormalized } from './mapper'
import type { SourceClient, FetchOptions, SourceResult } from '../types'

const BASE_URL = 'https://api.openalex.org'
const POLITE_EMAIL = process.env.OPENALEX_EMAIL || 'research@vigilanciatecnologica.com'

export class OpenAlexClient implements SourceClient {
  name = 'openalex'
  rateLimit = { requestsPerSecond: 10, requestsPerDay: 100000 }

  async fetch(options: FetchOptions): Promise<SourceResult> {
    const allRecords: ReturnType<typeof mapOpenAlexToNormalized>[] = []
    let cursor = '*'
    const target = Math.min(options.maxResults || 200, 200)

    const params = new URLSearchParams({
      search: options.query,
      'per-page': String(target),
      mailto: POLITE_EMAIL,
    })

    while (allRecords.length < target) {
      const url = `${BASE_URL}/works?${params.toString()}&cursor=${cursor}`
      const response = await axios.get(url)
      const { results, meta } = response.data

      if (!results || results.length === 0) break

      for (const work of results) {
        allRecords.push(mapOpenAlexToNormalized(work))
        if (allRecords.length >= target) break
      }

      cursor = meta?.next_cursor
      if (!cursor) break
    }

    return {
      records: allRecords,
      total: allRecords.length,
      source: 'openalex',
      fetchedAt: new Date(),
    }
  }
}
