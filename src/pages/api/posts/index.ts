import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../../prisma/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method, body: requestBody } = req

  console.log('API posts', method)

  switch (method) {
    case 'GET': {
      const posts = await prisma.post.findMany()
      res.status(200).json(posts)
      break
    }
    case 'POST': {
      try {
        const post: Prisma.PostCreateInput = JSON.parse(requestBody)
        const postSaved = await prisma.post.create({ data: post })
        res.status(200).json(postSaved)
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
