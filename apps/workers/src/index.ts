import 'dotenv/config'
import { prisma } from '@vt/database'
import { connection } from './queues'
import { normalizationWorker } from './workers/normalization.worker'
import { openAlexWorker } from './workers/ingestion/openalex.worker'
import { crossrefWorker } from './workers/ingestion/crossref.worker'
import { lensWorker } from './workers/ingestion/lens.worker'
import { patentsViewWorker } from './workers/ingestion/patentsview.worker'

console.log('🚀 VT Workers starting...')

const workers = [
  openAlexWorker,
  crossrefWorker,
  lensWorker,
  patentsViewWorker,
  normalizationWorker,
]

for (const worker of workers) {
  worker.on('completed', (job) => {
    console.log(`✅ [${worker.name}] Job ${job.id} completed`)
  })
  worker.on('failed', (job, err) => {
    console.error(`❌ [${worker.name}] Job ${job?.id} failed: ${err.message}`)
  })
}

async function shutdown() {
  console.log('Shutting down workers...')
  await Promise.all(workers.map((w) => w.close()))
  await prisma.$disconnect()
  await connection.quit()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
