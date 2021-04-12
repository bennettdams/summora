import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const post: Prisma.PostCreateInput = JSON.parse(req.body)
    const postSaved = await prisma.post.create({ data: post })
    res.status(200).json(postSaved)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
}
