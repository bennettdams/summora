import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../../prisma/prisma'
import { logAPI } from '../../../util/logger'

export type PostPostsAPI = Exclude<
  Prisma.PromiseReturnType<typeof findPosts>,
  null
>[number]

async function findPosts() {
  try {
    return await prisma.post.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        category: true,
      },
    })
  } catch (error) {
    throw new Error(`Error while finding posts: ${error}`)
  }
}

export default async function _postsAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method, body: requestBody } = req

  logAPI('POSTS', method)

  switch (method) {
    case 'GET': {
      const posts = await findPosts()
      res.status(200).json(posts)
      break
    }
    case 'POST': {
      try {
        const post: Prisma.PostCreateInput = JSON.parse(requestBody)
        const postCreated = await prisma.post.create({ data: post })
        res.status(200).json(postCreated)
      } catch (err) {
        res.status(400).json({ message: 'Something went wrong' })
      }
      break
    }
    default: {
      res.setHeader('Allow', ['GET', 'PUT'])
      // res.status(405).json({ message: 'Method not allowed' })
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
