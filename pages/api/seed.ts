import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// http://localhost:3000/api/seed

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    posts.forEach(async (post) => {
      await prisma.post.create({ data: post })
    })
    res.status(200).json(posts)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
}

const posts: Prisma.PostCreateInput[] = [...new Array(3)].map((_, i) => ({
  title: i + 1 + ' title',
  content: i + 1 + ' content',
}))
