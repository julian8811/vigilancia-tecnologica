import { CrossrefClient } from '@vt/sources'
import { createIngestionWorker } from './base.worker'

export const crossrefWorker = createIngestionWorker('crossref', new CrossrefClient())
