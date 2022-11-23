import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getPlaiceholder } from 'plaiceholder'
import { prisma } from '../../../server/db/client'
import { ApiImageUploadAvatarsRequestBody } from '../../../services/api-service'
import { getUserFromRequest } from '../../../services/auth-service'
import { convertImageForUpload } from '../../../services/image-upload-service'
import { uploadAvatarSupabase } from '../../../services/supabase/supabase-service'
import { deleteAvatarInStorage } from '../../../services/use-cloud-storage'
import { logAPI } from '../../../util/logger'
import { createRandomId } from '../../../util/random-id'

export const avatarImageIdPrefix = 'avatar'

export type ApiAvatarsUpload = Prisma.PromiseReturnType<typeof updateUserImage>

async function updateUserImage({
  userId,
  imageId,
  imageBlurDataURL,
}: {
  userId: string
  imageId: string
  imageBlurDataURL: string
}) {
  try {
    return await prisma.user.update({
      where: { userId },
      data: {
        imageId,
        imageBlurDataURL,
      },
      select: {
        imageId: true,
        imageBlurDataURL: true,
      },
    })
  } catch (error) {
    throw new Error(
      `Error while updating user image for user ID ${userId}: ${error}`
    )
  }
}

interface Request extends NextApiRequest {
  body: ApiImageUploadAvatarsRequestBody
}

// need to disable Next.js' parser for parsing multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function _apiImageUploadAvatars(
  req: Request,
  res: NextApiResponse
): Promise<void> {
  const { method } = req

  logAPI('IMAGE_UPLOAD_AVATARS', method)

  const { userIdAuth, error } = await getUserFromRequest(req, res)

  if (error) {
    return res
      .status(401)
      .json({ message: `Error while authenticating: ${error.message}` })
  } else {
    const userId = userIdAuth

    switch (method) {
      case 'POST': {
        try {
          const fileForUpload = await convertImageForUpload(req)

          const userDb = await prisma.user.findUnique({
            where: { userId },
            select: { imageId: true },
          })

          if (!userDb) {
            return res.status(404).json({
              message: `User ${userId} not found.`,
            })
          } else {
            // delete old image
            const imageIdOld = userDb.imageId
            if (imageIdOld) {
              await deleteAvatarInStorage({
                userId,
                imageId: imageIdOld,
                req,
                res,
              })
            }

            const imageIdNew = `${avatarImageIdPrefix}-${userId}-${createRandomId()}`
            await uploadAvatarSupabase({
              userId,
              imageId: imageIdNew,
              avatarFileParsed: fileForUpload,
              req,
              res,
            })

            const { base64: imageBlurDataURL } = await getPlaiceholder(
              fileForUpload
            )

            const newImageData = await updateUserImage({
              userId,
              imageId: imageIdNew,
              imageBlurDataURL,
            })

            console.info(`[API] Uploaded avatar image for ${userId}`)
            return res.status(200).json(newImageData)
          }
        } catch (error) {
          console.error(
            `[API] Error while uploading avatar image for user ${userId}:`,
            error
          )
          return res.status(400).json({ error })
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
