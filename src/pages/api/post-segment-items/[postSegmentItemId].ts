import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { logAPI } from '../../../util/logger'

export interface PostSegmentItemUpdate {
  postId: string
  postSegmentId: string
  postSegmentItemToUpdate: Prisma.PostSegmentItemUpdateWithoutPostSegmentInput
}

async function updatePostSegmentItem({
  postId,
  postSegmentId,
  postSegmentItemToUpdate,
}: PostSegmentItemUpdate) {
  const now = new Date()

  const postSegmentItemId = postSegmentItemToUpdate.id
  if (typeof postSegmentItemId !== 'string')
    throw new Error('Post segment item ID is missing/in the wrong format!')

  try {
    return await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        updatedAt: now,
        segments: {
          update: {
            where: {
              id: postSegmentId,
            },
            data: {
              updatedAt: now,
              items: {
                update: {
                  where: {
                    id: postSegmentItemId,
                  },
                  data: postSegmentItemToUpdate,
                },
              },
            },
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
      `Error while updating post segment item with ID ${postSegmentItemId}: ${error}`
    )
  }
}

export default async function _postSegmentItemsPostSegmentItemIdAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postSegmentItemId },
    body: requestBody,
    method,
  } = req

  logAPI(
    'POST_SEGMENT_ITEMS_POST_SEGMENT_ITEM_ID',
    method,
    `Post Segment Item ID: ${postSegmentItemId}`
  )

  if (!postSegmentItemId) {
    res.status(404).end('No post segment item ID!')
  } else if (typeof postSegmentItemId !== 'string') {
    res.status(400).end('Post segment item ID wrong format!')
  } else {
    switch (method) {
      case 'PUT': {
        const {
          postId,
          postSegmentId,
          postSegmentItemToUpdate,
        }: PostSegmentItemUpdate = JSON.parse(requestBody)

        if (!postId) {
          res.status(404).end('No post ID!')
        } else {
          const postWithUpdatedPostSegmentItem = await updatePostSegmentItem({
            postId,
            postSegmentId,
            postSegmentItemToUpdate,
          })

          res.status(200).json(postWithUpdatedPostSegmentItem)
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
