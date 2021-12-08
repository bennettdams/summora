import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserByCookie } from '../../../../services/auth-service'
import { uploadPostSegmentImageSupabase } from '../../../../services/supabase/supabase-service'
import { logAPI } from '../../../../util/logger'
import { prisma } from '../../../../prisma/prisma'
import { parseMultipartForm } from '../../../../services/image-upload-service'
import { ApiImageUploadPostSegmentsRequestBody } from '../../../../services/api-service'

export type ApiImageUploadPostSegment = void

interface Request extends NextApiRequest {
  body: ApiImageUploadPostSegmentsRequestBody
}

// need to disable Next.js' parser for parsing multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function _imageUploadPostSegmentAPI(
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
  } else if (typeof postSegmentId !== 'string') {
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

            /*
             * TODO we only do this because we don't have the post ID available right now.
             * Should be done by providing the ID via the API itself.
             */
            const postForSegment = await prisma.postSegment.findUnique({
              where: { id: postSegmentId },
              include: { Post: { select: { authorId: true } } },
            })

            if (!postForSegment) {
              return res.status(404).json({
                message: `Post for post segment ${postSegmentId} not found.`,
              })
            } else if (postForSegment.Post.authorId !== userId) {
              return res.status(404).json({
                message: `User ${userId} is not the author of the post for post segment ${postSegmentId}.`,
              })
            } else {
              // TODO validation?
              // TODO convert png etc.
              await uploadPostSegmentImageSupabase(
                postForSegment.postId,
                userId,
                postSegmentId,
                fileParsed,
                req
              )

              await prisma.postSegment.update({
                where: { id: postSegmentId },
                data: { hasImage: true },
              })

              const message = `Uploaded post segment image for ${postSegmentId}`
              console.info(`[API] ${message}`)
              return res.status(200).json({ message })
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
