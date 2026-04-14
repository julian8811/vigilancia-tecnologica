import IORedis from 'ioredis'
import { Queue } from 'bullmq'

export const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// Dead letter queue names
const DLQ_NAMES = {
  ingestion: 'ingestion-dlq',
  normalization: 'normalization-dlq',
  'ai-enrichment': 'ai-enrichment-dlq',
  'alert-check': 'alert-check-dlq',
  'report-generation': 'report-generation-dlq',
}

export const ingestionQueue = new Queue('ingestion', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})

export const normalizationQueue = new Queue('normalization', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
})

export const aiEnrichmentQueue = new Queue('ai-enrichment', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
  },
})

export const alertCheckQueue = new Queue('alert-check', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 5000 },
  },
})

export const reportGenerationQueue = new Queue('report-generation', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 10000 },
  },
})

// Helper to get failed jobs from DLQ for inspection
export async function getFailedJobs(queueName: string) {
  const dlq = new Queue(DLQ_NAMES[queueName as keyof typeof DLQ_NAMES] || queueName, { connection })
  const failed = await dlq.getFailed()
  return failed
}
