import { TRPCError } from '@trpc/server'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../pages/api/auth/[...nextauth]'

/**
 * Used to ensure the requester is the author of a given topic (like post, comment, etc.).
 * @returns the entity the author was checked with
 */
export async function ensureAuthorTRPC<
  TEntity extends Record<string, unknown> | null
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
    entity: TEntity
  }>
}): Promise<TEntity> {
  const { authorId, entity } = await cbQueryEntity()

  if (authorId !== userIdAuth) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You are not the author of this topic (${topic}).`,
    })
  } else {
    return entity
  }
}

export async function getServerAuthSession(ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) {
  return await getServerSession(ctx.req, ctx.res, authOptions)
}
