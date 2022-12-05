import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { checkAuthTRPC } from './api-security'
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

/** Procedure only for authenticated users. */
export const protectedProcedure = procedure.use(async ({ ctx, next }) => {
  if (!ctx.req || !ctx.res) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'You are missing `req` or `res` in your call.',
    })
  } else {
    const userIdAuth = await checkAuthTRPC(ctx.req, ctx.res)

    return next({
      ctx: {
        userIdAuth,
        req: ctx.req,
        res: ctx.res,
      },
    })
  }
})
