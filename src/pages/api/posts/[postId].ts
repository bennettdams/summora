import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { Prisma } from '@prisma/client'

export type Post = Exclude<Prisma.PromiseReturnType<typeof findPost>, null>
export type PostSegment = Post['segments'][number]
export type PostSegmentItem = PostSegment['items'][number]

async function findPost(postId: string) {
  try {
    return await prisma.post.findUnique({
      where: { id: postId },
      include: {
        segments: {
          orderBy: { segmentNo: 'asc' },
          include: { items: { orderBy: { itemNo: 'asc' } } },
        },
      },
    })
  } catch (error) {
    throw new Error(`Error while finding post: ${error}`)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postId },
    method,
  } = req

  console.log('API post ', method, postId)
  if (!postId) {
    res.status(404).end('No post ID!')
  } else if (typeof postId !== 'string') {
    res.status(400).end('Post ID wrong format!')
  } else {
    switch (method) {
      case 'GET': {
        const post = await findPost(postId)
        if (!post) {
          res.status(404).json(`Cannot find post for id ${postId}`)
        } else {
          res.status(200).json(post)
        }
        break
      }
      default: {
        //   res.setHeader('Allow', ['GET', 'PUT'])
        res.setHeader('Allow', ['GET'])
        // res.status(405).json({ message: 'Method not allowed' })
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
