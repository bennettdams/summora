import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/prisma'

// http://localhost:3000/api/seed

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    await prisma.post.deleteMany({})

    posts.forEach(async (post) => {
      await prisma.post.create({ data: post })
    })
    res.status(200).json(posts)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
}

const posts: Prisma.PostCreateInput[] = [...new Array(3)].map((_, i) => ({
  title: 'title ' + (i + 1),
  content: 'content' + (i + 1),
  createdAt: new Date().toISOString(),
}))
