import { Worker, Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { connection, normalizationQueue } from '../../queues'
import type { SourceClient } from '@vt/sources'

// Create Prisma client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Structured error logging
function logError(source: string, job: Job, error: Error, context: Record<string, unknown>) {
  const errorLog = {
    source,
    jobId: job.id,
    jobName: job.name,
    attempt: job.attemptsMade,
    maxAttempts: job.opts.attempts,
    error: {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    context,
    timestamp: new Date().toISOString(),
  }
  console.error(JSON.stringify({ level: 'error', ...errorLog }))
}

export function createIngestionWorker(source: string, client: SourceClient) {
  return new Worker(
    'ingestion',
    async (job: Job) => {
      if (job.data.source !== source) return

      const { runId, queryText, maxResults, workspaceId } = job.data

      await prisma.searchRunSource.updateMany({
        where: { runId, source },
        data: { status: 'running' },
      })

      try {
        const result = await client.fetch({ query: queryText, maxResults: maxResults || 200 })

        const jobs = result.records.map((record) => ({
          name: 'normalize',
          data: { record, runId, workspaceId },
        }))

        if (jobs.length > 0) {
          await normalizationQueue.addBulk(jobs)
        }

        await prisma.searchRunSource.updateMany({
          where: { runId, source },
          data: { status: 'completed', resultCount: result.records.length },
        })

        console.log(`[${source}] Ingested ${result.records.length} records for run ${runId}`)
        return { count: result.records.length, source }
      } catch (error: any) {
        const errorContext = { runId, queryText, maxResults, workspaceId, source }
        
        await prisma.searchRunSource.updateMany({
          where: { runId, source },
          data: { status: 'failed', errorMsg: String(error.message) },
        })
        
        logError(source, job, error, errorContext)
        throw error
      }
    },
    { connection, concurrency: 3 }
  )
}
