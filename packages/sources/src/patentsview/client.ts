import axios from 'axios'
import { mapPatentsViewToNormalized } from './mapper'
import type { SourceClient, FetchOptions, SourceResult } from '../types'

const BASE_URL = 'https://search.patentsview.org/api/v1'

export class PatentsViewClient implements SourceClient {
  name = 'patentsview'
  rateLimit = { requestsPerSecond: 1, requestsPerDay: 5000 }

  async fetch(options: FetchOptions): Promise<SourceResult> {
    const safeQuery = options.query.replace(/"/g, '')
    const params = {
      q: `{"_text_any":{"patent_title":"${safeQuery}"}}`,
      f: '["patent_id","patent_title","patent_abstract","patent_date","patent_year","inventor_last_name","inventor_first_name","ipc_main_group","patent_number"]',
      o: `{"per_page":${Math.min(options.maxResults || 100, 1000)}}`,
    }

    try {
      const response = await axios.get(`${BASE_URL}/patent/`, { params })
      const patents = response.data?.patents || []
      return { records: patents.map(mapPatentsViewToNormalized), total: patents.length, source: 'patentsview', fetchedAt: new Date() }
    } catch {
      return { records: [], total: 0, source: 'patentsview', fetchedAt: new Date() }
    }
  }
}
