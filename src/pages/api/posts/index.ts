import type { NextApiRequest, NextApiResponse } from 'next'
import { dbFindPosts, DbFindPosts } from '../../../lib/db'
import { logAPI } from '../../../util/logger'

export type ApiPosts = DbFindPosts

export default async function _apiPosts(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method } = req

  logAPI('POSTS', method)

  switch (method) {
    case 'GET': {
      const posts: ApiPosts = await dbFindPosts()

      res.status(200).json(posts)
      break
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
