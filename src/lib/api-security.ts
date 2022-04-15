import { NextApiRequest, NextApiResponse } from 'next'
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
