import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const collectionsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.savedCollection.findMany({
      where: { userId: ctx.user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { updatedAt: 'desc' },
    })
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(200), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.savedCollection.create({
        data: { userId: ctx.user.id, name: input.name, description: input.description },
      })
    }),

  addRecord: protectedProcedure
    .input(z.object({ collectionId: z.string().uuid(), recordId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.collectionItem.upsert({
        where: { collectionId_recordId: input },
        create: { ...input },
        update: {},
      })
    }),

  removeRecord: protectedProcedure
    .input(z.object({ collectionId: z.string().uuid(), recordId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.collectionItem.delete({ where: { collectionId_recordId: input } })
      return { ok: true }
    }),

  getItems: protectedProcedure
    .input(z.object({ collectionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.prisma.savedCollection.findUnique({
        where: { id: input.collectionId },
      })
      if (!collection || collection.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return ctx.prisma.collectionItem.findMany({
        where: { collectionId: input.collectionId },
        include: {
          record: { include: { scientificRecord: true, patentRecord: true } },
        },
        orderBy: { addedAt: 'desc' },
      })
    }),
})
