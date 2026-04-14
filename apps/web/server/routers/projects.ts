import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const projectsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.user.id,
          },
        },
      })
      if (!member) throw new TRPCError({ code: 'FORBIDDEN' })

      return ctx.prisma.project.findMany({
        where: { workspaceId: input.workspaceId, deletedAt: null },
        include: {
          _count: { select: { strategies: true, reports: true } },
        },
        orderBy: { updatedAt: 'desc' },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.user.id,
          },
        },
      })

      if (!member || !['admin', 'analyst'].includes(member.role)) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return ctx.prisma.project.create({
        data: {
          workspaceId: input.workspaceId,
          name: input.name,
          description: input.description,
          color: input.color || '#3B82F6',
          createdBy: ctx.user.id,
        },
      })
    }),
})
