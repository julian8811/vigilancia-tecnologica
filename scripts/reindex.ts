import { prisma } from '../packages/database/src'
import { getMeilisearchClient, ARTICLES_INDEX, PATENTS_INDEX, initializeIndexes } from '../apps/web/lib/search/meilisearch'

async function reindexAll() {
  console.log('Starting reindex...')
  await initializeIndexes()

  const client = getMeilisearchClient()
  const batchSize = 100
  let skip = 0

  while (true) {
    const records = await prisma.normalizedRecord.findMany({
      skip,
      take: batchSize,
      where: { deletedAt: null },
      include: { scientificRecord: true, patentRecord: true },
    })

    if (records.length === 0) break

    const articles: any[] = []
    const patents: any[] = []

    for (const record of records) {
      const base = {
        id: record.id,
        workspaceId: record.workspaceId,
        title: record.title,
        abstract: record.abstract,
        year: record.year,
        country: record.country,
        language: record.language,
        isOpenAccess: record.isOpenAccess,
        citationCount: record.citationCount,
      }

      if (record.recordType === 'article' && record.scientificRecord) {
        articles.push({
          ...base,
          doi: record.scientificRecord.doi,
          journal: record.scientificRecord.journal,
          documentType: record.scientificRecord.documentType,
        })
      } else if (record.recordType === 'patent' && record.patentRecord) {
        patents.push({
          ...base,
          publicationNumber: record.patentRecord.publicationNumber,
          jurisdiction: record.patentRecord.jurisdiction,
          legalStatus: record.patentRecord.legalStatus,
          ipcCode: record.patentRecord.ipcCodes[0],
        })
      }
    }

    if (articles.length > 0) await client.index(ARTICLES_INDEX).addDocuments(articles)
    if (patents.length > 0) await client.index(PATENTS_INDEX).addDocuments(patents)

    skip += batchSize
    console.log(`Indexed ${skip} records...`)
  }

  console.log('✅ Reindex complete')
  await prisma.$disconnect()
}

reindexAll().catch(console.error)
