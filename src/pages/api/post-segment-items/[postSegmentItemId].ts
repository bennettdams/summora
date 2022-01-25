import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { ApiPostSegmentItemUpdateRequestBody } from '../../../services/api-service'
import { logAPI } from '../../../util/logger'

export type ApiPostSegmentItemUpdate = Prisma.PromiseReturnType<
  typeof updatePostSegmentItem
>

async function updatePostSegmentItem(
  postSegmentItemId: string,
  postSegmentItemToUpdate: ApiPostSegmentItemUpdateRequestBody
) {
  const now = new Date()

  try {
    return await prisma.postSegmentItem.update({
      where: { id: postSegmentItemId },
      data: {
        updatedAt: now,
        content: postSegmentItemToUpdate.content,
      },
    })
  } catch (error) {
    throw new Error(
      `Error while updating post segment item with ID ${postSegmentItemId}: ${error}`
    )
  }
}

export default async function _apiPostSegmentItem(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postSegmentItemId },
    body: requestBody,
    method,
  } = req
  logAPI(
    'POST_SEGMENT_ITEM',
    method,
    `Post segment item ID: ${postSegmentItemId}`
  )

  if (!postSegmentItemId) {
    res.status(500).end('No post segment item ID!')
  } else if (typeof postSegmentItemId !== 'string') {
    res.status(500).end('Post segment item ID wrong format!')
  } else {
    switch (method) {
      case 'PUT': {
        // TODO parse needed?
        const postSegmentItemToUpdate: ApiPostSegmentItemUpdateRequestBody =
          requestBody

        const postSegmentItemUpdated: ApiPostSegmentItemUpdate =
          await updatePostSegmentItem(
            postSegmentItemId,
            postSegmentItemToUpdate
          )

        res.status(200).json(postSegmentItemUpdated)
        break
      }
      default: {
        res.setHeader('Allow', ['PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
