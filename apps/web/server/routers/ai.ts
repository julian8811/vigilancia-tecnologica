import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { aiCompletion } from '@/lib/ai/client'
import { buildSummarizePrompt, buildExpandQueryPrompt } from '@/lib/ai/prompts/summarize'

export const aiRouter = createTRPCRouter({
  expandQuery: protectedProcedure
    .input(
      z.object({
        queryText: z.string().min(1),
        domain: z.string().default('general'),
        language: z.string().default('es'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompt = buildExpandQueryPrompt(input.queryText, input.domain, input.language)
        const response = await aiCompletion({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          maxTokens: 800,
        })

        const suggestedTerms = JSON.parse(response)
        return { suggestedTerms, expandedQuery: input.queryText }
      } catch {
        return { suggestedTerms: [], expandedQuery: input.queryText }
      }
    }),

  summarizeRecord: protectedProcedure
    .input(z.object({ recordId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.prisma.normalizedRecord.findUnique({
        where: { id: input.recordId },
      })

      if (!record) throw new TRPCError({ code: 'NOT_FOUND' })

      const existing = await ctx.prisma.aiAnnotation.findFirst({
        where: { recordId: input.recordId, annotationType: 'summary' },
      })

      if (existing && !existing.isEditedByUser) return existing

      const prompt = buildSummarizePrompt({
        title: record.title,
        abstract: record.abstract || undefined,
        year: record.year || undefined,
        type: record.recordType,
      })

      const summary = await aiCompletion({
        messages: [
          { role: 'system', content: 'Sos un analista de vigilancia tecnológica experto.' },
          { role: 'user', content: prompt },
        ],
        maxTokens: 400,
        temperature: 0.2,
      })

      if (existing) {
        return ctx.prisma.aiAnnotation.update({
          where: { id: existing.id },
          data: { content: summary },
        })
      }

      return ctx.prisma.aiAnnotation.create({
        data: {
          recordId: input.recordId,
          annotationType: 'summary',
          content: summary,
          modelUsed: 'gpt-4o',
          promptVersion: 'v1',
        },
      })
    }),
})
