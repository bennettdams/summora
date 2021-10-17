import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { logAPI } from '../../../util/logger'

export interface PostSegmentItemCreate {
  postId: string
  postSegmentId: string
  postSegmentItemToCreate: Prisma.PostSegmentItemCreateWithoutPostSegmentInput
}

async function createPostSegmentItem({
  postId,
  postSegmentId,
  postSegmentItemToCreate,
}: PostSegmentItemCreate) {
  const now = new Date()

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
                create: postSegmentItemToCreate,
              },
            },
          },
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
    throw new Error(`Error while create post segment item: ${error}`)
  }
}

export default async function _postSegmentItemsAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req

  logAPI('POST_SEGMENT_ITEMS', method)

  switch (method) {
    case 'POST': {
      const {
        postId,
        postSegmentId,
        postSegmentItemToCreate,
      }: PostSegmentItemCreate = JSON.parse(requestBody)

      if (!postId || !postSegmentId) {
        res.status(404).end('No post ID or post segment ID!')
      } else {
        const postWithCreatedSegmentItem = await createPostSegmentItem({
          postId,
          postSegmentId,
          postSegmentItemToCreate: {
            ...postSegmentItemToCreate,
            id: undefined,
          },
        })

        // await new Promise((resolve) => setTimeout(resolve, 3000))

        res.status(200).json(postWithCreatedSegmentItem)
      }
      break
    }
    default: {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
