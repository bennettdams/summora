import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../../prisma/prisma'
import { logAPI } from '../../../util/logger'

export type ApiPosts = (Prisma.PromiseReturnType<typeof findPosts>[number] & {
  noOfLikes: number
})[]

async function findPosts() {
  try {
    return await prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { username: true, hasAvatar: true } },
        category: true,
        segments: { orderBy: { createdAt: 'asc' } },
        tags: { select: { id: true, title: true } },
        /*
         * TODO
         * Using _count for implicit Many-To-Many relations does not work right now (30.11.2021),
         * that's why we can't use it for "likedBy".
         * https://github.com/prisma/prisma/issues/9880
         */
        // _count: { select: { comments: true, likedBy: true } },
        _count: { select: { comments: true } },
        likedBy: { select: { userId: true } },
      },
    })
  } catch (error) {
    throw new Error(`Error finding posts: ${error}`)
  }
}

export default async function _apiPosts(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method } = req

  logAPI('POSTS', method)

  switch (method) {
    case 'GET': {
      const posts: ApiPosts = (await findPosts()).map((post) => ({
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
