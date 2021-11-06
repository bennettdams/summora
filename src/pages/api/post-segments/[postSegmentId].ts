import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { ApiPostSegmentUpdateRequestBody } from '../../../services/api-service'
import { logAPI } from '../../../util/logger'

export type ApiPostSegmentUpdate = Prisma.PromiseReturnType<
  typeof updatePostSegment
>

async function updatePostSegment(
  postSegmentId: string,
  postSegmentToUpdate: ApiPostSegmentUpdateRequestBody
) {
  const now = new Date()

  try {
    return await prisma.postSegment.update({
      where: { id: postSegmentId },
      data: {
        updatedAt: now,
        title: postSegmentToUpdate.title,
        subtitle: postSegmentToUpdate.subtitle,
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  } catch (error) {
    throw new Error(
      `Error while updating post segment with ID ${postSegmentId}: ${error}`
    )
  }
}

export default async function _postSegmentAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postSegmentId },
    body: requestBody,
    method,
  } = req
  logAPI('POST_SEGMENT', method, `Post segment ID: ${postSegmentId}`)

  if (!postSegmentId) {
    res.status(500).end('No post segment ID!')
  } else if (typeof postSegmentId !== 'string') {
    res.status(500).end('Post segment ID wrong format!')
  } else {
    switch (method) {
      case 'PUT': {
        // TODO parse needed?
        const postSegmentToUpdate: ApiPostSegmentUpdateRequestBody = requestBody

        const postSegmentUpdated: ApiPostSegmentUpdate =
          await updatePostSegment(postSegmentId, postSegmentToUpdate)

        res.status(200).json(postSegmentUpdated)
        break
      }
      default: {
        res.setHeader('Allow', ['PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
