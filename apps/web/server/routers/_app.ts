import { createTRPCRouter } from '../trpc'
import { workspaceRouter } from './workspace'
import { projectsRouter } from './projects'
import { searchRouter } from './search'
import { aiRouter } from './ai'
import { recordsRouter } from './records'
import { analyticsRouter } from './analytics'
import { reportsRouter } from './reports'
import { alertsRouter } from './alerts'
import { collectionsRouter } from './collections'
import { exportRouter } from './export'

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  projects: projectsRouter,
  search: searchRouter,
  ai: aiRouter,
  records: recordsRouter,
  analytics: analyticsRouter,
  reports: reportsRouter,
  alerts: alertsRouter,
  collections: collectionsRouter,
  export: exportRouter,
})

export type AppRouter = typeof appRouter
