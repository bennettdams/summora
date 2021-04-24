import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/prisma'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    await prisma.post.deleteMany({})
    // await prisma.postSegment.deleteMany({})

    const postIdsCreated: string[] = []

    posts.forEach(async (post) => {
      const postCreated = await prisma.post.create({ data: post })
      postIdsCreated.push(postCreated.id)
    })
    res.status(200).json(posts)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
}

const posts: Prisma.PostCreateInput[] = [...new Array(11)].map((_, i) => {
  const post: Prisma.PostCreateInput = {
    title:
      'This is a title that is a bit longer for testing purposes ' + (i + 1),
    subtitle:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + (i + 1),
  }
  return post
})
