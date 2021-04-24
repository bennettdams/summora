import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { Prisma } from '@prisma/client'

export type Post = Exclude<Prisma.PromiseReturnType<typeof getPost>, null>

async function getPost(postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: { segments: true },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postId },
    method,
  } = req

  console.log('API post ', postId, method)

  switch (method) {
    case 'GET': {
      if (!postId) {
        res.status(404).end('Post ID unknown!')
      } else if (typeof postId !== 'string') {
        res.status(400).end('Post ID wrong format!')
      } else {
        const post = await getPost(postId)
        res.status(200).json(post)
      }
      break
    }
    // case 'PUT': {
    //   res.status(200).json({ id, name: name || `User ${id}` })
    //   break
    // }
    default: {
      //   res.setHeader('Allow', ['GET', 'PUT'])
      res.setHeader('Allow', ['GET'])
      // res.status(405).json({ message: 'Method not allowed' })
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
