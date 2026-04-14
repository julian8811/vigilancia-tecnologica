import { z, type ZodType, ZodRawShape } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

type Json = object

export const searchRouter = createTRPCRouter({
  validate: protectedProcedure
    .input(z.object({ queryText: z.string() }))
    .query(async ({ input }) => {
      let depth = 0
      for (const char of input.queryText) {
        if (char === '(') depth++
        if (char === ')') depth--
        if (depth < 0) return { valid: false, error: 'Paréntesis no coinciden' }
      }
      if (depth !== 0) return { valid: false, error: 'Paréntesis no cerrados' }
      return { valid: true, error: null }
    }),

  run: protectedProcedure
    .input(
      z.object({
        strategyId: z.string().uuid(),
        versionId: z.string().uuid().optional(),
        sources: z.array(z.string()).optional(),
        maxResults: z.number().int().min(1).max(2000).default(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const strategy = await ctx.prisma.searchStrategy.findUnique({
        where: { id: input.strategyId },
        include: {
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
          project: true,
        },
      })

      if (!strategy) throw new TRPCError({ code: 'NOT_FOUND' })

      const version = input.versionId
        ? await ctx.prisma.strategyVersion.findUnique({ where: { id: input.versionId } })
        : strategy.versions[0]

      if (!version) throw new TRPCError({ code: 'NOT_FOUND', message: 'No version found' })

      const sources = input.sources || version.sources || ['openalex', 'crossref']

      const run = await ctx.prisma.searchRun.create({
        data: {
          strategyId: strategy.id,
          versionId: version.id,
          status: 'pending',
          triggeredBy: 'manual',
          sources: {
            create: sources.map((source) => ({ source, status: 'pending' })),
          },
        },
      })

      // Enqueue jobs via BullMQ
      try {
        const { Queue } = await import('bullmq')
        const IORedis = (await import('ioredis')).default
        const conn = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
          maxRetriesPerRequest: null,
        })
        const queue = new Queue('ingestion', { connection: conn })

        for (const source of sources) {
          await queue.add(`ingest-${source}`, {
            runId: run.id,
            strategyId: strategy.id,
            versionId: version.id,
            source,
            queryText: version.queryText,
            maxResults: input.maxResults,
            workspaceId: strategy.project.workspaceId,
          })
        }

        await ctx.prisma.searchRun.update({
          where: { id: run.id },
          data: { status: 'running', startedAt: new Date() },
        })

        await conn.quit()
      } catch {
        // Workers not available in all environments — run stays as pending
      }

      return { runId: run.id, status: 'pending', estimatedDuration: sources.length * 10 }
    }),

  runs: createTRPCRouter({
    get: protectedProcedure
      .input(z.object({ runId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return ctx.prisma.searchRun.findUnique({
          where: { id: input.runId },
          include: {
            sources: true,
            _count: { select: { runRecords: true } },
          },
        })
      }),

    list: protectedProcedure
      .input(z.object({ strategyId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return ctx.prisma.searchRun.findMany({
          where: { strategyId: input.strategyId },
          include: { sources: true, _count: { select: { runRecords: true } } },
          orderBy: { startedAt: 'desc' },
          take: 20,
        })
      }),
  }),

  strategies: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ projectId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return ctx.prisma.searchStrategy.findMany({
          where: { projectId: input.projectId, deletedAt: null },
          include: {
            versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
            _count: { select: { searchRuns: true } },
          },
          orderBy: { updatedAt: 'desc' },
        })
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.string().uuid(),
          name: z.string().min(1).max(200),
          description: z.string().optional(),
          queryText: z.string().min(1),
          sources: z.array(z.string()).default(['openalex', 'crossref']),
          filters: z.record(z.unknown()).default({}),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.$transaction(async (tx) => {
          const strategy = await tx.searchStrategy.create({
            data: {
              projectId: input.projectId,
              name: input.name,
              description: input.description,
              createdBy: ctx.user.id,
            },
          })

          const version = await tx.strategyVersion.create({
            data: {
              strategyId: strategy.id,
              versionNumber: 1,
              queryText: input.queryText,
              queryAst: { raw: input.queryText } as unknown as Json,
              sources: input.sources,
              filters: input.filters as unknown as Json,
              createdBy: ctx.user.id,
            },
          })

          await tx.searchStrategy.update({
            where: { id: strategy.id },
            data: { currentVersionId: version.id },
          })

          return strategy
        })
      }),

    update: protectedProcedure
      .input(
        z.object({
          strategyId: z.string().uuid(),
          name: z.string().min(1).max(200).optional(),
          queryText: z.string().min(1).optional(),
          sources: z.array(z.string()).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { strategyId, name, queryText, sources, notes } = input

        return ctx.prisma.$transaction(async (tx) => {
          if (name) {
            await tx.searchStrategy.update({ where: { id: strategyId }, data: { name } })
          }

          if (queryText || sources) {
            const last = await tx.strategyVersion.findFirst({
              where: { strategyId },
              orderBy: { versionNumber: 'desc' },
            })
            const nextVersion = (last?.versionNumber ?? 0) + 1

            const version = await tx.strategyVersion.create({
              data: {
                strategyId,
                versionNumber: nextVersion,
                queryText: queryText || last?.queryText || '',
                queryAst: { raw: queryText || last?.queryText || '' },
                sources: sources || last?.sources || ['openalex'],
                filters: (last?.filters as any) || {},
                notes,
                createdBy: ctx.user.id,
              },
            })

            await tx.searchStrategy.update({
              where: { id: strategyId },
              data: { currentVersionId: version.id },
            })
          }

          return tx.searchStrategy.findUnique({ where: { id: strategyId } })
        })
      }),
  }),
})
