import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiImageUploadAvatarsRequestBody } from '../../../services/api-service'
import { getUserByCookie } from '../../../services/auth-service'
import { uploadAvatarSupabase } from '../../../services/supabase/supabase-service'
import { logAPI } from '../../../util/logger'
import { prisma } from '../../../prisma/prisma'
import { convertImageForUpload } from '../../../services/image-upload-service'
import { Prisma } from '@prisma/client'
import { createRandomId } from '../../../util/random-id'
import { getPlaiceholder } from 'plaiceholder'
import { deleteAvatarInStorage } from '../../../services/use-cloud-storage'

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
              })
            }

            const imageIdNew = `avatar-${userId}-${createRandomId()}`
            await uploadAvatarSupabase({
              userId,
              imageId: imageIdNew,
              avatarFileParsed: fileForUpload,
              req,
            })

            const { base64: imageBlurDataURL } = await getPlaiceholder(
              fileForUpload
            )

            const userUpdated = await updateUserImage({
              userId,
              imageId: imageIdNew,
              imageBlurDataURL,
            })

            console.info(`[API] Uploaded avatar image for ${userId}`)
            return res.status(200).json(userUpdated)
          }
        } catch (error) {
          console.error(
            `[API] Error while uploading avatar image for user ${userId}:`,
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
