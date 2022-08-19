import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { ApiPostSegmentCreateRequestBody } from '../../../services/api-service'
import { logAPI } from '../../../util/logger'

export type ApiPostSegmentCreate = Prisma.PromiseReturnType<
  typeof createPostSegment
>

async function createPostSegment(
  postId: string,
  postSegmentToCreate: ApiPostSegmentCreateRequestBody['postSegmentToCreate']
) {
  try {
    return await prisma.postSegment.create({
      data: {
        postId,
        title: postSegmentToCreate.title,
        subtitle: postSegmentToCreate.subtitle,
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  } catch (error) {
    throw new Error(`Error while creating post segment: ${error}`)
  }
}

export default async function _apiPostSegments(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req
  logAPI('POST_SEGMENTS', method)

  switch (method) {
    case 'POST': {
      // TODO parse needed?
      const { postId, postSegmentToCreate }: ApiPostSegmentCreateRequestBody =
        requestBody

      const postSegmentCreated: ApiPostSegmentCreate = await createPostSegment(
        postId,
        postSegmentToCreate
      )

      res.status(200).json(postSegmentCreated)
      break
    }
    default: {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
