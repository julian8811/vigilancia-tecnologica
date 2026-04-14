import axios from 'axios'
import { mapLensToNormalized } from './mapper'
import type { SourceClient, FetchOptions, SourceResult } from '../types'

const BASE_URL = 'https://api.lens.org'

export class LensClient implements SourceClient {
  name = 'lens'
  rateLimit = { requestsPerSecond: 1, requestsPerDay: 1000 }

  private apiKey = process.env.LENS_API_KEY || ''

  async fetch(options: FetchOptions): Promise<SourceResult> {
    if (!this.apiKey) {
      return { records: [], total: 0, source: 'lens', fetchedAt: new Date() }
    }

    const body = {
      query: { match: { _type: 'fulltext', query: options.query } },
      size: Math.min(options.maxResults || 100, 500),
      include: [
        'lens_id', 'title', 'abstract', 'year_published', 'publication_number',
        'jurisdiction', 'legal_status', 'filing_date', 'date_published',
        'ipc_classifications', 'applicant', 'inventor',
      ],
    }

    try {
      const response = await axios.post(`${BASE_URL}/patent/search`, body, {
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      })
      const data = response.data?.data || []
      return { records: data.map(mapLensToNormalized), total: data.length, source: 'lens', fetchedAt: new Date() }
    } catch {
      return { records: [], total: 0, source: 'lens', fetchedAt: new Date() }
    }
  }
}
