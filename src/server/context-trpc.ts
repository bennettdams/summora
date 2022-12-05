import { type inferAsyncReturnType } from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { prisma } from './db/client'

type CreateContextOptions = Partial<CreateNextContextOptions>

/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createSSGHelpers` where we don't have `req`/`res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 **/
export async function createContextTRPCInner(opts?: CreateContextOptions) {
  return {
    ...opts,
    prisma,
  }
}

/**
 * Outer context. Will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 **/
export async function createContextTRPC(opts: CreateNextContextOptions) {
  const contextInner = await createContextTRPCInner()

  return {
    ...contextInner,
    req: opts.req,
    res: opts.res,
  }
}

export type ContextTRPC = inferAsyncReturnType<typeof createContextTRPCInner>
