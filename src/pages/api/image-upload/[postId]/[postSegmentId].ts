import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserByCookie } from '../../../../services/auth-service'
import {
  deletePostSegmentImageSupabase,
  uploadPostSegmentImageSupabase,
} from '../../../../services/supabase/supabase-service'
import { logAPI } from '../../../../util/logger'
import { prisma } from '../../../../prisma/prisma'
import { parseMultipartForm } from '../../../../services/image-upload-service'
import { ApiImageUploadPostSegmentsRequestBody } from '../../../../services/api-service'
import { createRandomId } from '../../../../util/random-id'
import { Prisma } from '@prisma/client'

export type ApiImageUploadPostSegment = Prisma.PromiseReturnType<
  typeof updatePostSegmentImageId
>

async function updatePostSegmentImageId({
  postSegmentId,
  imageId,
}: {
  postSegmentId: string
  imageId: string
}) {
  const now = new Date()

  try {
    return await prisma.postSegment.update({
      where: { id: postSegmentId },
      data: {
        updatedAt: now,
        imageId,
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

interface Request extends NextApiRequest {
  body: ApiImageUploadPostSegmentsRequestBody
}

// need to disable Next.js' parser for parsing multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function _apiImageUploadPostSegment(
  req: Request,
  res: NextApiResponse
): Promise<void> {
  const {
    method,
    query: { postId, postSegmentId },
  } = req

  logAPI('IMAGE_UPLOAD_POST_SEGMENTS', method)

  if (!postId || !postSegmentId) {
    res.status(500).end('No post ID or post segment ID!')
  } else if (
    !(typeof postSegmentId === 'string' && typeof postId === 'string')
  ) {
    res.status(500).end('Post ID or post segment ID wrong format!')
  } else {
    const { data: user, error } = await getUserByCookie(req)

    if (error) {
      return res
        .status(401)
        .json({ message: `Error while authenticating: ${error.message}` })
    } else if (!user) {
      return res.status(401).json({
        message:
          'Error while authenticating: No user for that cookie in database.',
      })
    } else {
      const userId = user.id

      switch (method) {
        case 'POST': {
          try {
            const fileParsed = await parseMultipartForm(req)

            const postSegmentDb = await prisma.postSegment.findUnique({
              where: { id: postSegmentId },
              select: { imageId: true, Post: { select: { authorId: true } } },
            })

            if (!postSegmentDb) {
              return res.status(404).json({
                message: `Postsegment ${postSegmentId} not found.`,
              })
            } else if (postSegmentDb.Post.authorId !== userId) {
              return res.status(404).json({
                message: `User ${userId} is not the author of the post for post segment ${postSegmentId}.`,
              })
            } else {
              // delete old image
              const imageIdOld = postSegmentDb.imageId
              if (imageIdOld) {
                await deletePostSegmentImageSupabase({
                  postId,
                  authorId: postSegmentDb.Post.authorId,
                  imageId: imageIdOld,
                  req,
                })
              }

              const imageIdNew = `segment-${postSegmentId}-${createRandomId()}`
              // TODO validation?
              // TODO convert png etc.
              await uploadPostSegmentImageSupabase({
                postId,
                authorId: userId,
                imageId: imageIdNew,
                postSegmentImageFileParsed: fileParsed,
                req,
              })

              const segmentUpdated = await updatePostSegmentImageId({
                postSegmentId,
                imageId: imageIdNew,
              })

              console.info(
                `[API] Uploaded post segment image for ${postSegmentId}`
              )
              return res.status(200).json(segmentUpdated)
            }
          } catch (error) {
            console.error(
              `[API] Error while uploading image for post segment ${postSegmentId}:`,
              error
            )
            return res.status(401).json({ error })
          }
        }
        default: {
          res.setHeader('Allow', ['POST'])
          res.status(405).end(`Method ${method} Not Allowed`)
          break
        }
      }
    }
  }
}
