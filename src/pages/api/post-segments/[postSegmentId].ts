import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'

export interface PostSegmentUpdate {
  postId: string
  postSegmentToUpdate: Prisma.PostSegmentUpdateWithoutItemsInput
}

async function updatePostSegment({
  postId,
  postSegmentToUpdate,
}: PostSegmentUpdate) {
  const now = new Date()

  const postSegmentId = postSegmentToUpdate.id
  if (typeof postSegmentId !== 'string')
    throw new Error('Post segment ID is missing/in the wrong format!')

  try {
    return await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        updatedAt: now,
        segments: {
          update: {
            where: { id: postSegmentId },
            data: postSegmentToUpdate,
          },
        },
      },
      include: {
        segments: {
          orderBy: { createdAt: 'asc' },
          include: {
            items: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    })
  } catch (error) {
    throw new Error(
      `Error while updating post segment with ID ${postSegmentId}: ${error}`
    )
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postSegmentId },
    body: requestBody,
    method,
  } = req

  console.log('API post segment', method, postSegmentId)
  if (!postSegmentId) {
    res.status(404).end('No post segment ID!')
  } else if (typeof postSegmentId !== 'string') {
    res.status(400).end('Post segment ID wrong format!')
  } else {
    switch (method) {
      case 'PUT': {
        const { postId, postSegmentToUpdate }: PostSegmentUpdate =
          JSON.parse(requestBody)

        if (!postId) {
          res.status(404).end('No post ID!')
        } else {
          const postWithUpdatedPostSegment = await updatePostSegment({
            postId,
            postSegmentToUpdate,
          })

          res.status(200).json(postWithUpdatedPostSegment)
        }
        break
      }
      default: {
        res.setHeader('Allow', ['PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
