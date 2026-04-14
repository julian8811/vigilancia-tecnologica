import { MeiliSearch } from 'meilisearch'

const MEILISEARCH_URL = process.env.MEILISEARCH_URL || 'http://localhost:7700'
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY || 'masterKey_dev_only'

let _client: MeiliSearch | null = null

export function getMeilisearchClient(): MeiliSearch {
  if (!_client) {
    _client = new MeiliSearch({ host: MEILISEARCH_URL, apiKey: MEILISEARCH_MASTER_KEY })
  }
  return _client
}

export const ARTICLES_INDEX = 'articles'
export const PATENTS_INDEX = 'patents'

export async function initializeIndexes() {
  const client = getMeilisearchClient()

  await client.createIndex(ARTICLES_INDEX, { primaryKey: 'id' }).catch(() => {})
  const articlesIndex = client.index(ARTICLES_INDEX)
  await articlesIndex.updateSettings({
    searchableAttributes: ['title', 'abstract', 'journal', 'authors'],
    filterableAttributes: ['year', 'country', 'language', 'isOpenAccess', 'workspaceId', 'documentType'],
    sortableAttributes: ['year', 'citationCount', 'relevanceScore'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
    },
  })

  await client.createIndex(PATENTS_INDEX, { primaryKey: 'id' }).catch(() => {})
  const patentsIndex = client.index(PATENTS_INDEX)
  await patentsIndex.updateSettings({
    searchableAttributes: ['title', 'abstract', 'publicationNumber', 'inventors', 'applicants'],
    filterableAttributes: ['year', 'jurisdiction', 'legalStatus', 'workspaceId', 'ipcCode'],
    sortableAttributes: ['year', 'filingDate', 'publicationDate'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  })
}

export interface SearchParams {
  query: string
  workspaceId: string
  indexName: typeof ARTICLES_INDEX | typeof PATENTS_INDEX
  filters?: string
  sort?: string[]
  page?: number
  hitsPerPage?: number
  facets?: string[]
}

export async function searchRecords(params: SearchParams) {
  const client = getMeilisearchClient()
  const index = client.index(params.indexName)

  const baseFilter = `workspaceId = "${params.workspaceId}"`
  const filter = params.filters ? `${baseFilter} AND ${params.filters}` : baseFilter

  return index.search(params.query, {
    filter,
    sort: params.sort,
    page: params.page || 1,
    hitsPerPage: params.hitsPerPage || 20,
    facets: params.facets,
    attributesToHighlight: ['title', 'abstract'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
  })
}

export async function indexRecordsBatch(
  records: any[],
  indexName: typeof ARTICLES_INDEX | typeof PATENTS_INDEX
) {
  if (records.length === 0) return
  const client = getMeilisearchClient()
  await client.index(indexName).addDocuments(records, { primaryKey: 'id' })
}
