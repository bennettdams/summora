import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../server/db/client'
import { ApiPostSegmentItemCreateRequestBody } from '../../../services/api-service'
import { logAPI } from '../../../util/logger'

export type ApiPostSegmentItemCreate = Prisma.PromiseReturnType<
  typeof createPostSegmentItem
>

async function createPostSegmentItem(
  postSegmentId: string,
  postSegmentItemToCreate: ApiPostSegmentItemCreateRequestBody['postSegmentItemToCreate']
) {
  try {
    return await prisma.postSegmentItem.create({
      data: {
        postSegmentId,
        content: postSegmentItemToCreate.content,
      },
    })
  } catch (error) {
    throw new Error(`Error while creating post segment item: ${error}`)
  }
}

export default async function _apiPostSegmentItems(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req
  logAPI('POST_SEGMENT_ITEMS', method)

  switch (method) {
    case 'POST': {
      // TODO parse needed?
      const {
        postSegmentId,
        postSegmentItemToCreate,
      }: ApiPostSegmentItemCreateRequestBody = requestBody

      const postSegmentItemCreated: ApiPostSegmentItemCreate =
        await createPostSegmentItem(postSegmentId, postSegmentItemToCreate)

      res.status(200).json(postSegmentItemCreated)
      break
    }
    default: {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
