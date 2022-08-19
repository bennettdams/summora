import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { ensureAuthor } from '../../../lib/api-security'
import { prisma } from '../../../prisma/prisma'
import { ApiPostSegmentUpdateRequestBody } from '../../../services/api-service'
import { deletePostSegmentImageInStorage } from '../../../services/use-cloud-storage'
import { logAPI } from '../../../util/logger'

export type ApiPostSegmentUpdate = Prisma.PromiseReturnType<
  typeof updatePostSegment
>

export type ApiPostSegmentDelete = boolean

async function updatePostSegment(
  postSegmentId: string,
  postSegmentToUpdate: ApiPostSegmentUpdateRequestBody
) {
  try {
    return await prisma.postSegment.update({
      where: { id: postSegmentId },
      data: {
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

async function deletePostSegment(postSegmentId: string) {
  try {
    return await prisma.postSegment.delete({
      where: { id: postSegmentId },
      select: null,
    })
  } catch (error) {
    throw new Error(`Error while deleting post segment: ${error}`)
  }
}

export default async function _apiPostSegment(
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
    await ensureAuthor({
      topic: 'post segment',
      req,
      res,
      cbQueryEntity: async () => {
        const entity = await prisma.postSegment.findUnique({
          rejectOnNotFound: true,
          where: { id: postSegmentId },
          select: {
            postId: true,
            Post: { select: { authorId: true } },
            imageId: true,
          },
        })

        return {
          authorId: entity.Post.authorId,
          entity,
        }
      },

      cbExecute: async (entity) => {
        switch (method) {
          case 'PUT': {
            // TODO parse needed?
            const postSegmentToUpdate: ApiPostSegmentUpdateRequestBody =
              requestBody

            const postSegmentUpdated: ApiPostSegmentUpdate =
              await updatePostSegment(postSegmentId, postSegmentToUpdate)

            res.status(200).json(postSegmentUpdated)
            break
          }
          case 'DELETE': {
            // Delete the segment image in cloud storage
            const postId = entity.postId
            const imageId = entity.imageId
            const authorId = entity.Post.authorId
            if (imageId) {
              await deletePostSegmentImageInStorage({
                postId,
                authorId,
                imageId,
                req,
              })
            }

            await deletePostSegment(postSegmentId)

            const apiResult: ApiPostSegmentDelete = true

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
