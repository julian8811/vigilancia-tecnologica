import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const alertsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ projectId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const workspace = ctx.user.workspaceMembers[0]?.workspace
      if (!workspace) return []

      return ctx.prisma.alert.findMany({
        where: {
          ...(input.projectId ? { projectId: input.projectId } : {}),
          project: { workspaceId: workspace.id },
        },
        include: {
          project: { select: { name: true } },
          strategy: { select: { name: true } },
          alertRuns: { orderBy: { ranAt: 'desc' }, take: 1 },
        },
        orderBy: { nextRunAt: 'asc' },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        strategyId: z.string().uuid(),
        name: z.string().min(1).max(200),
        frequency: z.enum(['daily', 'weekly', 'monthly']),
        minNewResults: z.number().int().min(1).default(1),
        notifyEmail: z.boolean().default(true),
        notifyInApp: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const nextRunAt = new Date()
      if (input.frequency === 'daily') nextRunAt.setDate(nextRunAt.getDate() + 1)
      if (input.frequency === 'weekly') nextRunAt.setDate(nextRunAt.getDate() + 7)
      if (input.frequency === 'monthly') nextRunAt.setMonth(nextRunAt.getMonth() + 1)

      return ctx.prisma.alert.create({
        data: {
          projectId: input.projectId,
          strategyId: input.strategyId,
          name: input.name,
          frequency: input.frequency,
          minNewResults: input.minNewResults,
          notifyEmail: input.notifyEmail,
          notifyInApp: input.notifyInApp,
          nextRunAt,
          createdBy: ctx.user.id,
        },
      })
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.alert.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.alert.delete({ where: { id: input.id } })
      return { ok: true }
    }),
})
