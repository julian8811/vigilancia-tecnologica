import { PatentsViewClient } from '@vt/sources'
import { createIngestionWorker } from './base.worker'

export const patentsViewWorker = createIngestionWorker('patentsview', new PatentsViewClient())
