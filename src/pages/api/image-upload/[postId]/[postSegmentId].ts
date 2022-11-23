import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../server/db/client'
import { ApiImageUploadPostSegmentsRequestBody } from '../../../../services/api-service'
import { getUserFromRequest } from '../../../../services/auth-service'
import { convertImageForUpload } from '../../../../services/image-upload-service'
import { uploadPostSegmentImageSupabase } from '../../../../services/supabase/supabase-service'
import { deletePostSegmentImageInStorage } from '../../../../services/use-cloud-storage'
import { logAPI } from '../../../../util/logger'
import { createRandomId } from '../../../../util/random-id'

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
  try {
    return await prisma.postSegment.update({
      where: { id: postSegmentId },
      data: {
        imageId,
      },
      select: {
        id: true,
        imageId: true,
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
    const { userIdAuth, error } = await getUserFromRequest(req, res)

    if (error) {
      return res
        .status(401)
        .json({ message: `Error while authenticating: ${error.message}` })
    } else if (!userIdAuth) {
      return res.status(401).json({
        message:
          'Error while authenticating: No user for that cookie in database.',
      })
    } else {
      switch (method) {
        case 'POST': {
          try {
            const fileForUpload = await convertImageForUpload(req)

            const postSegmentDb = await prisma.postSegment.findUnique({
              where: { id: postSegmentId },
              select: { imageId: true, Post: { select: { authorId: true } } },
            })

            if (!postSegmentDb) {
              return res.status(404).json({
                message: `Postsegment ${postSegmentId} not found.`,
              })
            } else if (postSegmentDb.Post.authorId !== userIdAuth) {
              return res.status(404).json({
                message: `User ${userIdAuth} is not the author of the post for post segment ${postSegmentId}.`,
              })
            } else {
              // delete old image
              const imageIdOld = postSegmentDb.imageId
              if (imageIdOld) {
                await deletePostSegmentImageInStorage({
                  postId,
                  authorId: postSegmentDb.Post.authorId,
                  imageId: imageIdOld,
                  req,
                  res,
                })
              }

              const imageIdNew = `segment-${postSegmentId}-${createRandomId()}`
              await uploadPostSegmentImageSupabase({
                postId,
                authorId: userIdAuth,
                imageId: imageIdNew,
                postSegmentImageFileParsed: fileForUpload,
                req,
                res,
              })

              const segmentUpdatedNewImageId = await updatePostSegmentImageId({
                postSegmentId,
                imageId: imageIdNew,
              })

              console.info(
                `[API] Uploaded post segment image for ${postSegmentId}`
              )
              return res.status(200).json(segmentUpdatedNewImageId)
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
