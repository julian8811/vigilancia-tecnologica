import { OpenAlexClient } from '@vt/sources'
import { createIngestionWorker } from './base.worker'

export const openAlexWorker = createIngestionWorker('openalex', new OpenAlexClient())
