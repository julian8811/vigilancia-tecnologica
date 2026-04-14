import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@vt/database'
import superjson from 'superjson'
import { ZodError } from 'zod'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId } = auth()

  const user = userId
    ? await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          workspaceMembers: {
            include: { workspace: true },
          },
        },
      })
    : null

  return {
    prisma,
    user,
    userId,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createCallerFactory = t.createCallerFactory
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})
