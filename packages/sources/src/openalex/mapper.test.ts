import { describe, it, expect } from 'vitest'
import { mapOpenAlexToNormalized } from './mapper'

const mockWork = {
  id: 'https://openalex.org/W2741809809',
  title: 'CRISPR-Cas9: A Revolutionary Tool for Genome Editing',
  doi: 'https://doi.org/10.1126/science.1258096',
  publication_year: 2014,
  abstract: 'We describe the use of CRISPR-Cas9...',
  cited_by_count: 15000,
  open_access: { is_oa: true },
  language: 'en',
  relevance_score: 0.95,
  primary_location: {
    source: { display_name: 'Science' },
    landing_page_url: 'https://science.org/doi/10.1126/science.1258096',
  },
  authorships: [
    {
      author: { display_name: 'Jennifer A. Doudna' },
      institutions: [{ display_name: 'UC Berkeley', country_code: 'US' }],
    },
  ],
}

describe('mapOpenAlexToNormalized', () => {
  it('maps type correctly', () => {
    expect(mapOpenAlexToNormalized(mockWork).type).toBe('article')
  })

  it('maps basic fields', () => {
    const r = mapOpenAlexToNormalized(mockWork)
    expect(r.title).toBe('CRISPR-Cas9: A Revolutionary Tool for Genome Editing')
    expect(r.year).toBe(2014)
    expect(r.isOpenAccess).toBe(true)
    expect(r.citationCount).toBe(15000)
  })

  it('strips doi prefix', () => {
    const r = mapOpenAlexToNormalized(mockWork)
    expect(r.sourceIds.doi).toBe('10.1126/science.1258096')
    expect(r.sourceIds.openalex).toBe('W2741809809')
  })

  it('generates consistent dedup hash', () => {
    expect(mapOpenAlexToNormalized(mockWork).dedupHash).toBe(mapOpenAlexToNormalized(mockWork).dedupHash)
  })

  it('maps author names', () => {
    const r = mapOpenAlexToNormalized(mockWork)
    const normalized = r.normalized as any
    expect(normalized.authors[0].name).toBe('Jennifer A. Doudna')
  })
})
