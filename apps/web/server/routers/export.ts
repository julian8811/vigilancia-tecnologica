import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const ExportFormat = z.enum(['csv', 'xlsx'])

const ExportFields = z.object({
  title: z.boolean().default(true),
  abstract: z.boolean().default(true),
  year: z.boolean().default(true),
  authors: z.boolean().default(true),
  source: z.boolean().default(true),
  citationCount: z.boolean().default(false),
})

export const exportRouter = createTRPCRouter({
  // Get exportable fields for a project
  fields: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
      })
      if (!project) throw new TRPCError({ code: 'NOT_FOUND' })

      return {
        name: 'Project export',
        fields: [
          { key: 'title', label: 'Title', type: 'string' as const },
          { key: 'abstract', label: 'Abstract', type: 'string' as const },
          { key: 'year', label: 'Year', type: 'number' as const },
          { key: 'authors', label: 'Authors', type: 'string' as const },
          { key: 'source', label: 'Source', type: 'string' as const },
          { key: 'citationCount', label: 'Citations', type: 'number' as const },
        ],
      }
    }),

  // Get records for export (paginated)
  records: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        fields: ExportFields.optional(),
        limit: z.number().min(1).max(1000).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        include: {
          strategies: {
            where: { deletedAt: null },
            include: {
              searchRuns: {
                orderBy: { startedAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      })

      if (!project) throw new TRPCError({ code: 'NOT_FOUND' })

      // Get run IDs for this project
      const runs = project.strategies.flatMap((s) => s.searchRuns)
      const runIds = runs.map((r) => r.id)

      if (runIds.length === 0) {
        return { records: [], total: 0 }
      }

      const fields = input.fields || {
        title: true,
        abstract: true,
        year: true,
        authors: true,
        source: true,
        citationCount: false,
      }

      const records = await ctx.prisma.normalizedRecord.findMany({
        where: {
          runRecords: { some: { runId: { in: runIds } } },
        },
        include: {
          scientificRecord: true,
          patentRecord: true,
          recordAuthors: {
            include: { author: true },
            orderBy: { authorOrder: 'asc' },
          },
        },
        take: input.limit,
        skip: input.offset,
      })

      const formatted = records.map((r) => {
        const row: Record<string, string | number | null | undefined> = { id: r.id }

        if (fields.title) row.title = r.title
        if (fields.abstract) row.abstract = r.abstract || ''
        if (fields.year) row.year = r.year
        if (fields.source) {
          const src = r.sourceIds as Record<string, string>
          row.source = src.openalex || src.crossref || src.patentsview || src.lens || ''
        }
        if (fields.authors) {
          row.authors = r.recordAuthors.map((a) => a.author.fullName).join('; ')
        }
        if (fields.citationCount) row.citationCount = r.citationCount

        return row
      })

      return { records: formatted, total: formatted.length }
    }),
})