import { Worker } from 'bullmq'
import { prisma } from '@vt/database'
import { connection } from '../queues'

export const normalizationWorker = new Worker(
  'normalization',
  async (job) => {
    const { record, runId, workspaceId } = job.data

    const existing = await prisma.normalizedRecord.findFirst({
      where: { workspaceId, dedupHash: record.dedupHash },
    })

    let dbRecord = existing

    if (!existing) {
      dbRecord = await prisma.normalizedRecord.create({
        data: {
          workspaceId,
          recordType: record.type,
          title: record.title,
          abstract: record.abstract,
          year: record.year,
          country: record.country,
          language: record.language,
          sourceIds: record.sourceIds,
          dedupHash: record.dedupHash,
          rawPayload: record.raw as any,
          normalizedPayload: record.normalized as any,
          relevanceScore: record.relevanceScore,
          isOpenAccess: record.isOpenAccess ?? false,
          citationCount: record.citationCount ?? 0,
        },
      })

      if (record.type === 'article') {
        const art = record.normalized as any
        await prisma.scientificRecord.create({
          data: {
            normalizedRecordId: dbRecord.id,
            doi: art.doi,
            journal: art.journal,
            documentType: 'article',
            url: art.url,
          },
        })
      } else if (record.type === 'patent') {
        const pat = record.normalized as any
        await prisma.patentRecord.create({
          data: {
            normalizedRecordId: dbRecord.id,
            publicationNumber: pat.publicationNumber,
            jurisdiction: pat.jurisdiction,
            legalStatus: pat.legalStatus,
            ipcCodes: pat.ipcCodes || [],
            cpcCodes: [],
          },
        })
      }
    }

    if (dbRecord) {
      await prisma.runRecord.upsert({
        where: { runId_recordId: { runId, recordId: dbRecord.id } },
        create: { runId, recordId: dbRecord.id },
        update: {},
      })
    }
  },
  { connection, concurrency: 10 }
)
