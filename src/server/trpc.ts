import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { ContextTRPC } from './context-trpc'

const t = initTRPC.context<ContextTRPC>().create({
  transformer: superjson,
  /*
   * See https://trpc.io/docs/v10/error-formatting
   */
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    }
  },
})

export const router = t.router

/** Unauthenticated procedure. */
export const procedure = t.procedure

/**
 * Reusable middleware to ensure users are logged in.
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userIdAuth || !ctx.req || !ctx.res) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: `You are not authenticated.`,
    })
  }

  return next({
    ctx: {
      userIdAuth: ctx.userIdAuth,
      req: ctx.req,
      res: ctx.res,
    },
  })
})

/** Procedure only for authenticated users. */
export const protectedProcedure = t.procedure.use(isAuthed)
