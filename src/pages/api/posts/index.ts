import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbCreatePost, dbFindPosts, DbFindPosts } from '../../../lib/db'
import { ApiPostsCreateRequestBody } from '../../../services/api-service'
import { getUserFromRequest } from '../../../services/auth-service'
import { logAPI } from '../../../util/logger'

export type ApiPosts = DbFindPosts
export type ApiPostsCreate = Prisma.PromiseReturnType<typeof dbCreatePost>

export default async function _apiPosts(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method, body: requestBody } = req

  logAPI('POSTS', method)

  switch (method) {
    case 'GET': {
      const posts: ApiPosts = await dbFindPosts()

      res.status(200).json(posts)
      break
    }
    case 'POST': {
      const { userIdAuth, error } = await getUserFromRequest(req, res)

      if (error) {
        return res.status(401).json({
          message: `Error while getting user from cookie: ${error.message}`,
        })
      } else if (!userIdAuth) {
        return res.status(401).json({
          message: 'Error while authenticating: No user for that cookie.',
        })
      } else {
        const { postToCreate }: ApiPostsCreateRequestBody = requestBody

        const postCreated: ApiPostsCreate = await dbCreatePost(
          userIdAuth,
          postToCreate
        )

        res.status(200).json(postCreated)
        break
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
