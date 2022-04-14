import { NextApiRequest, NextApiResponse } from 'next'
import { getUserByCookie } from '../services/auth-service'

/**
 * Used to ensure the requester is the author of a given topic (like post, comment, etc.).
 */
export async function ensureAuthor({
  req,
  res,
  topic,
  cbDetermineAuthorId,
  cbExecute,
}: {
  req: NextApiRequest
  res: NextApiResponse
  topic: string
  /**
   * Callback to determine the author ID. This is a callback and not a variable to reduce unnecessary
   * DB calls, as the author ID is only needed after authentication was succesfully determined.
   */
  cbDetermineAuthorId: () => Promise<string>
  /**
   * The main callback to execute for the API.
   */
  cbExecute: () => Promise<void>
}) {
  const { data: user, error } = await getUserByCookie(req)

  if (!user || error) {
    res.status(401).json({ message: 'Not signed in' })
  } else {
    const postAuthorId = await cbDetermineAuthorId()

    if (postAuthorId !== user.id) {
      res.status(403).end(`You're not the author of this ${topic}.`)
    } else {
      await cbExecute()
    }
  }
}
