import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiAvatarsUploadRequestBody } from '../../../services/api-service'
import { getUserByCookie } from '../../../services/auth-service'
import { uploadAvatarSupabase } from '../../../services/supabase/supabase-service'
import { logAPI } from '../../../util/logger'
import { prisma } from '../../../prisma/prisma'
import { parseMultipartForm } from '../../../services/image-upload-service'

export type ApiAvatarsUpload = void

interface Request extends NextApiRequest {
  body: ApiAvatarsUploadRequestBody
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
          const fileParsed = await parseMultipartForm(req)

          // TODO validation?
          // TODO convert png etc.
          await uploadAvatarSupabase({
            userId,
            avatarFileParsed: fileParsed,
            req,
          })

          await prisma.user.update({
            where: { userId },
            data: { hasAvatar: true },
            // return not used
            select: null,
          })

          console.info(`[API] uploaded avatar for user ${userId}`)

          return res
            .status(200)
            .json({ message: `Uploaded avatar for user ${userId}` })
        } catch (error) {
          console.error('[API] Error while uploading avatar:', error)
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
  // }
}
