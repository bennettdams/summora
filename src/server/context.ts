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

  // let userId: string | null = null
  // if (req) {
  //   const { userAuth } = await getUserByCookie(req)
  //   userId = userAuth?.id ?? null
  // }

  return {
    req,
    res,
    prisma,
    // userId,
  }
}

type Context = trpc.inferAsyncReturnType<typeof createContext>

/**
 * Helper function to create a router with context.
 */
export const createRouter = () => trpc.router<Context>()
