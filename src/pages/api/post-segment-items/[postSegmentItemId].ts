import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'

// async function updatePostSegmentItem(
//   postSegmentItemId: string,
//   postSegmentItem: Prisma.PostSegmentItemUpdateInput
// ) {
//   try {
//     return await prisma.postSegmentItem.update({
//       data: postSegmentItem,
//       where: {
//         id: postSegmentItemId,
//       },
//     })
//   } catch (error) {
//     throw new Error(
//       `Error while updating post segment item with ID ${postSegmentItemId}: ${error}`
//     )
//   }
// }

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
          orderBy: { segmentNo: 'asc' },
          include: {
            items: { orderBy: { itemNo: 'asc' } },
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postSegmentItemId },
    body: requestBody,
    method,
  } = req

  console.log('API post segment item', method, postSegmentItemId)
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
          const postUpdated = await updatePostSegmentItem({
            postId,
            postSegmentId,
            postSegmentItemToUpdate,
          })

          res.status(200).json(postUpdated)
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
