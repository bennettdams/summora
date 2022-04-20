import type { NextApiRequest, NextApiResponse } from 'next'
import { logAPI } from '../../../util/logger'
import { dbFindPosts, DbFindPosts } from '../../../lib/db'

export type ApiPosts = (DbFindPosts[number] & {
  noOfLikes: number
})[]

export default async function _apiPosts(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method } = req

  logAPI('POSTS', method)

  switch (method) {
    case 'GET': {
      const posts: ApiPosts = (await dbFindPosts()).map((post) => ({
        ...post,
        noOfLikes: post.likedBy.length,
      }))
      res.status(200).json(posts)
      break
    }
    // case 'POST': {
    //   try {
    //     // const post: Prisma.PostCreateInput = JSON.parse(requestBody)
    //     const postCreated = await prisma.post.create({ data: post })
    //     res.status(200).json(postCreated)
    //   } catch (err) {
    //     res.status(400).json({ message: 'Something went wrong' })
    //   }
    //   break
    // }
    default: {
      res.setHeader('Allow', ['GET'])
      // res.status(405).json({ message: 'Method not allowed' })
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
