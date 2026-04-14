import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const recordsRouter = createTRPCRouter({
  getArticle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.prisma.normalizedRecord.findUnique({
        where: { id: input.id },
        include: {
          scientificRecord: true,
          aiAnnotations: true,
          recordAuthors: { include: { author: true }, orderBy: { authorOrder: 'asc' } },
        },
      })
      if (!record) throw new TRPCError({ code: 'NOT_FOUND' })
      return record
    }),

  getPatent: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const record = await ctx.prisma.normalizedRecord.findUnique({
        where: { id: input.id },
        include: {
          patentRecord: true,
          aiAnnotations: true,
          recordAuthors: { include: { author: true }, orderBy: { authorOrder: 'asc' } },
        },
      })
      if (!record) throw new TRPCError({ code: 'NOT_FOUND' })
      return record
    }),

  list: protectedProcedure
    .input(
      z.object({
        runId: z.string().uuid(),
        page: z.number().default(1),
        perPage: z.number().default(20),
        type: z.enum(['article', 'patent']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        runRecords: { some: { runId: input.runId } },
        ...(input.type ? { recordType: input.type } : {}),
        deletedAt: null,
      }

      const [total, records] = await ctx.prisma.$transaction([
        ctx.prisma.normalizedRecord.count({ where }),
        ctx.prisma.normalizedRecord.findMany({
          where,
          include: {
            scientificRecord: true,
            patentRecord: true,
            aiAnnotations: { where: { annotationType: 'summary' }, take: 1 },
          },
          orderBy: [{ relevanceScore: 'desc' }, { citationCount: 'desc' }],
          skip: (input.page - 1) * input.perPage,
          take: input.perPage,
        }),
      ])

      return { records, total, page: input.page, perPage: input.perPage }
    }),
})
