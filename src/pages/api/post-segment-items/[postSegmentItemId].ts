import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { ensureAuthor } from '../../../lib/api-security'
import { prisma } from '../../../prisma/prisma'
import { ApiPostSegmentItemUpdateRequestBody } from '../../../services/api-service'
import { logAPI } from '../../../util/logger'

export type ApiPostSegmentItemUpdate = Prisma.PromiseReturnType<
  typeof updatePostSegmentItem
>

export type ApiPostSegmentItemDelete = boolean

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

async function deletePostSegmentItem(postSegmentItemId: string) {
  try {
    return await prisma.postSegmentItem.delete({
      where: { id: postSegmentItemId },
      select: null,
    })
  } catch (error) {
    throw new Error(`Error while deleting post segment item: ${error}`)
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
    await ensureAuthor({
      topic: 'post segment item',
      req,
      res,
      cbQueryEntity: async () => {
        const entity = await prisma.postSegmentItem.findUnique({
          rejectOnNotFound: true,
          where: { id: postSegmentItemId },
          select: {
            PostSegment: { select: { Post: { select: { authorId: true } } } },
          },
        })
        return {
          authorId: entity.PostSegment.Post.authorId,
          entity,
        }
      },
      cbExecute: async () => {
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
          case 'DELETE': {
            await deletePostSegmentItem(postSegmentItemId)

            const apiResult: ApiPostSegmentItemDelete = true

            res.status(200).json(apiResult)
            break
          }
          default: {
            res.setHeader('Allow', ['PUT', 'DELETE'])
            res.status(405).end(`Method ${method} Not Allowed`)
          }
        }
      },
    })
  }
}
