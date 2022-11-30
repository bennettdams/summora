import { TRPCError } from '@trpc/server'
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '../services/auth-service'
import { ContextTRPC } from './context-trpc'

/**
 * Used to ensure the requester is the author of a given topic (like post, comment, etc.).
 */
export async function ensureAuthor<
  TEntityType extends Record<string, unknown>
>({
  req,
  res,
  topic,
  cbQueryEntity,
  cbExecute,
}: {
  req: NextApiRequest
  res: NextApiResponse
  topic: string
  /**
   * Callback to query the entity. This is a callback and not a variable to reduce unnecessary
   * DB calls, as it & the author ID is only needed after authentication was succesfully determined.
   * It can later be used in the execution callback if needed.
   */
  cbQueryEntity: () => Promise<{
    authorId: string
    entity: TEntityType
  }>
  /**
   * The main callback to execute for the API.
   */
  cbExecute: (entity: TEntityType) => Promise<void>
}) {
  const { userIdAuth, error } = await getUserFromRequest(req, res)

  if (!userIdAuth || error) {
    res.status(401).json({ message: 'Not signed in' })
  } else {
    const { authorId: postAuthorId, entity } = await cbQueryEntity()

    if (postAuthorId !== userIdAuth) {
      res.status(403).end(`You're not the author of this ${topic}.`)
    } else {
      await cbExecute(entity)
    }
  }
}

export async function checkAuthTRPC(ctx: ContextTRPC): Promise<string> {
  if (!ctx.req || !ctx.res) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'No request given, cannot determine authentication.',
    })
  } else {
    const { userIdAuth, error } = await getUserFromRequest(ctx.req, ctx.res)

    if (!userIdAuth || !!error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `You are not authenticated.`,
      })
    } else {
      return userIdAuth
    }
  }
}

/**
 * Used to ensure the requester is the author of a given topic (like post, comment, etc.).
 * @returns the entity to check an author with
 */
export async function ensureAuthorTRPC<
  TEntity extends Record<string, unknown>
>({
  topic,
  ctx,
  cbQueryEntity,
}: {
  topic: string
  ctx: ContextTRPC
  /**
   * Callback to query the entity. This is a callback and not a variable to reduce unnecessary
   * DB calls, as it & the author ID is only needed after authentication was succesfully determined.
   * It can later be used in the execution callback if needed.
   */
  cbQueryEntity: () => Promise<{
    authorId: string
    entity: TEntity | null
  }>
}): Promise<TEntity | null> {
  const userId = await checkAuthTRPC(ctx)

  const { authorId, entity } = await cbQueryEntity()

  if (authorId !== userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You are not the author of this topic (${topic}).`,
    })
  } else {
    return entity ?? null
  }
}
