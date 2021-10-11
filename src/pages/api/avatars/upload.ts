import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiAvatarsUploadRequestBody, ROUTES_API } from '../../../services/api'
import { getUserByCookie } from '../../../services/auth-service'
import { uploadAvatarSupabase } from '../../../services/supabase/supabase-service'

interface Request extends NextApiRequest {
  body: ApiAvatarsUploadRequestBody
}

export default async function _avatarsAPI(
  req: Request,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req
  console.log(`[API] ${ROUTES_API.AVATARS_UPLOAD}`)

  const { data: user, error } = await getUserByCookie(req)

  if (error) {
    return res
      .status(401)
      .json({ message: `Error while authenticating: ${error.message}` })
  } else if (!user) {
    return res
      .status(401)
      .json({ message: 'Error while authenticating. no user.' })
  } else {
    const profileId = user.id

    switch (method) {
      case 'PUT': {
        const { filepath, avatarBlob } = requestBody

        try {
          await uploadAvatarSupabase(filepath, avatarBlob)

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
        res.setHeader('Allow', ['PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
        break
      }
    }
  }
  // }
}
