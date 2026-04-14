import { LensClient } from '@vt/sources'
import { createIngestionWorker } from './base.worker'

export const lensWorker = createIngestionWorker('lens', new LensClient())
