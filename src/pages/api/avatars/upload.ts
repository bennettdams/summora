import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiAvatarsUploadRequestBody } from '../../../services/api'
import { getUserByCookie } from '../../../services/auth-service'
import { uploadAvatarSupabase } from '../../../services/supabase/supabase-service'
import { logAPI } from '../../../util/logger'

interface Request extends NextApiRequest {
  body: ApiAvatarsUploadRequestBody
}

export default async function _avatarsUploadAPI(
  req: Request,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req

  logAPI('AVATARS_UPLOAD', method)

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
    const profileId = user.id

    switch (method) {
      case 'POST': {
        const { avatarFile } = requestBody

        try {
          // TODO validation?
          // TODO file extension
          await uploadAvatarSupabase(`${profileId}.jpg`, avatarFile, req)

          console.log(`[API] uploaded avatar for profile ${profileId}`)

          /*
           * Using explicit type to make sure we're returning what we've promised in
           * the API function (that called this API endpoint).
           */
          return res
            .status(200)
            .json({ message: `Uploaded avatar for profile ${profileId}` })
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
