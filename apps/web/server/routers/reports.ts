import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const reportsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.report.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        name: z.string().min(1).max(200),
        reportType: z.enum([
          'technical', 'executive', 'bulletin',
          'ficha_tecnologica', 'ficha_patente', 'state_of_art',
          'competitive', 'comparison_matrix',
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.report.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          reportType: input.reportType as any,
          status: 'draft',
          createdBy: ctx.user.id,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.report.delete({ where: { id: input.id } })
      return { ok: true }
    }),
})
