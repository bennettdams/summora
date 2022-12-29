import { TRPCError } from '@trpc/server'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import { getUserFromRequest } from '../services/auth-service'

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

export async function checkAuthTRPC(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string> {
  const { userIdAuth, error } = await getUserFromRequest(req, res)

  if (!userIdAuth || !!error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: `You are not authenticated.`,
    })
  } else {
    return userIdAuth
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
  userIdAuth,
  cbQueryEntity,
}: {
  topic: string
  userIdAuth: string
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
  const { authorId, entity } = await cbQueryEntity()

  if (authorId !== userIdAuth) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You are not the author of this topic (${topic}).`,
    })
  } else {
    return entity ?? null
  }
}

/**
 * Wrapper for `unstable_getServerSession` https://next-auth.js.org/configuration/nextjs.
 */
export async function getServerAuthSession(ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) {
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions)
}
