import { NextApiRequest, NextApiResponse } from 'next'
import { DbFindUserPosts, dbFindUserPosts } from '../../../../lib/db'

export type ApiUserPosts = DbFindUserPosts

export default async function _apiUserPosts(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { userId },
    method,
  } = req

  if (!userId) {
    res.status(500).end('No user ID!')
  } else if (typeof userId !== 'string') {
    res.status(500).end('User ID wrong format!')
  } else {
    switch (method) {
      case 'GET': {
        const userPosts: ApiUserPosts = await dbFindUserPosts(userId)

        res.status(200).json(userPosts)
        break
      }
      default: {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
