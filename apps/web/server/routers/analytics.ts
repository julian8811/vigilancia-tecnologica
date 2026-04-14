import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const analyticsRouter = createTRPCRouter({
  publicationsByYear: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const runs = await ctx.prisma.searchRun.findMany({
        where: { strategyId: { in: [] }, status: 'completed' },
        select: { id: true },
      })

      // Get all records from project runs
      const records = await ctx.prisma.normalizedRecord.groupBy({
        by: ['year', 'recordType'],
        where: {
          year: { not: null, gte: 2000 },
          runRecords: {
            some: {
              run: {
                strategy: { projectId: input.projectId },
              },
            },
          },
          deletedAt: null,
        },
        _count: true,
        orderBy: { year: 'asc' },
      })

      return records.map((r) => ({
        year: r.year!,
        type: r.recordType,
        count: r._count,
      }))
    }),

  topCountries: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const records = await ctx.prisma.normalizedRecord.groupBy({
        by: ['country'],
        where: {
          country: { not: null },
          runRecords: {
            some: { run: { strategy: { projectId: input.projectId } } },
          },
          deletedAt: null,
        },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 15,
      })

      return records
        .filter((r) => r.country)
        .map((r) => ({ country: r.country!, count: r._count }))
    }),

  topInstitutions: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const authors = await ctx.prisma.recordAuthor.groupBy({
        by: ['authorId'],
        where: {
          record: {
            runRecords: {
              some: { run: { strategy: { projectId: input.projectId } } },
            },
          },
        },
        _count: true,
        orderBy: { _count: { authorId: 'desc' } },
        take: 10,
      })

      return authors.map((a) => ({ authorId: a.authorId, count: a._count }))
    }),
})
