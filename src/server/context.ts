import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { prisma } from '../prisma/prisma'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  const req = opts?.req
  const res = opts?.res

  /**
   * We could check the session here, but it would occur on every request,
   * and we don't need that.
   */

  // const userIdAuth: string | null = null
  // if (req) {
  // const result = await getUserByCookie(req)
  // const error = result.error

  // if (error) {
  //   throw new TRPCError({
  //     code: 'UNAUTHORIZED',
  //     message: `Error while authenticating user.`,
  //     cause: error,
  //   })
  // }

  // userIdAuth = result.user?.id ?? null
  // }

  return {
    req,
    res,
    prisma,
    // userIdAuth,
  }
}

export type ContextTRPC = trpc.inferAsyncReturnType<typeof createContext>

/**
 * Helper function to create a router with context.
 */
export const createRouter = () => trpc.router<ContextTRPC>()
