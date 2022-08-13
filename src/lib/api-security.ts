import { TRPCError } from '@trpc/server'
import { NextApiRequest, NextApiResponse } from 'next'
import { ContextTRPC } from '../server/context'
import { getUserByCookie } from '../services/auth-service'

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
  const { data: user, error } = await getUserByCookie(req)

  if (!user || error) {
    res.status(401).json({ message: 'Not signed in' })
  } else {
    const { authorId: postAuthorId, entity } = await cbQueryEntity()

    if (postAuthorId !== user.id) {
      res.status(403).end(`You're not the author of this ${topic}.`)
    } else {
      await cbExecute(entity)
    }
  }
}

/**
 * @returns userIdAuth
 */
export async function checkAuthTRPC(ctx: ContextTRPC): Promise<string> {
  if (!ctx.req) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'The request object does not exist.',
    })
  } else {
    const { data, error } = await getUserByCookie(ctx.req)
    const userIdAuth = data?.id ?? null

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
