import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'

export interface PostSegmentCreate {
  postId: string
  postSegmentToCreate: Prisma.PostSegmentCreateWithoutPostInput
}

async function createPostSegment({
  postId,
  postSegmentToCreate,
}: PostSegmentCreate) {
  const now = new Date()

  try {
    return await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        updatedAt: now,
        segments: {
          create: postSegmentToCreate,
        },
      },
      include: {
        segments: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            items: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    })
  } catch (error) {
    throw new Error(`Error while create post segment: ${error}`)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req

  console.log('API post segment ', method)
  switch (method) {
    case 'POST': {
      const { postId, postSegmentToCreate }: PostSegmentCreate = JSON.parse(
        requestBody
      )

      if (!postId) {
        res.status(404).end('No post ID!')
      } else {
        const postWithCreatedSegment = await createPostSegment({
          postId,
          postSegmentToCreate: {
            ...postSegmentToCreate,
            id: undefined,
          },
        })

        // await new Promise((resolve) => setTimeout(resolve, 3000))

        res.status(200).json(postWithCreatedSegment)
      }
      break
    }
    default: {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
