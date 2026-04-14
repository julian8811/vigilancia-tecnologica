import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const workspaceRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.workspace.findMany({
      where: {
        members: { some: { userId: ctx.user.id } },
        deletedAt: null,
      },
      include: {
        members: { include: { user: true } },
        _count: { select: { projects: true } },
      },
    })
  }),

  get: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { slug: input.slug },
        include: {
          members: { include: { user: true } },
          _count: { select: { projects: true } },
        },
      })

      if (!workspace) throw new TRPCError({ code: 'NOT_FOUND' })

      const isMember = workspace.members.some((m) => m.userId === ctx.user.id)
      if (!isMember) throw new TRPCError({ code: 'FORBIDDEN' })

      return workspace
    }),

  stats: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify membership
      const member = await ctx.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.user.id,
          },
        },
      })
      if (!member) throw new TRPCError({ code: 'FORBIDDEN' })

      // Aggregate stats
      const [projectsCount, recordsCount, alertsCount, recentRuns] = await Promise.all([
        ctx.prisma.project.count({
          where: { workspaceId: input.workspaceId, status: 'active' },
        }),
        ctx.prisma.normalizedRecord.count({
          where: { workspaceId: input.workspaceId },
        }),
        ctx.prisma.alert.count({
          where: { project: { workspaceId: input.workspaceId }, isActive: true },
        }),
        ctx.prisma.searchRun.findFirst({
          where: {
            strategy: { project: { workspaceId: input.workspaceId } },
          },
          orderBy: { startedAt: 'desc' },
          select: { startedAt: true, status: true },
        }),
      ])

      return {
        projects: projectsCount,
        records: recordsCount,
        alerts: alertsCount,
        lastActivity: recentRuns?.startedAt || null,
        lastActivityStatus: recentRuns?.status || null,
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50)

      return ctx.prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: input.name,
            slug: `${slug}-${Date.now()}`,
            createdBy: ctx.user.id,
          },
        })

        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: ctx.user.id,
            role: 'admin',
          },
        })

        return workspace
      })
    }),
})
