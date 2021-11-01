import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiAvatarsUploadRequestBody } from '../../../services/api-service'
import { getUserByCookie } from '../../../services/auth-service'
import { uploadAvatarSupabase } from '../../../services/supabase/supabase-service'
import { logAPI } from '../../../util/logger'
import { Files, IncomingForm } from 'formidable'
import fs from 'fs'
import { FORM_DATA_FILE_KEY } from '../../../util/http'

interface Request extends NextApiRequest {
  body: ApiAvatarsUploadRequestBody
}

// need to disable Next.js' parser for parsing multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
}

const validMimeTypes = ['image/jpeg']

/**
 * Parse file form request payload.
 * This only works for a single file in the form data.
 */
async function parseMultipartForm(req: NextApiRequest) {
  try {
    // parse form with a Promise wrapper
    const files = await new Promise<Files>((resolve, reject) => {
      const form = new IncomingForm({
        multiples: false,
        allowEmptyFiles: false,
        // 30 mb
        maxFileSize: 30 * 1024 * 1024,
      })

      form.onPart = function (part) {
        const mimeType = part.mime

        if (!mimeType) {
          return reject(new Error('File has no MIME type.'))
        } else if (!validMimeTypes.includes(mimeType)) {
          return reject(new Error(`MIME type ${mimeType} is not supported.`))
        } else {
          // needed to actually use the part
          form.handlePart(part)
        }
      }

      form.parse(req, (err, _, files) => {
        if (err) return reject(err)
        resolve(files)
      })
    })

    const fileParsed = files[FORM_DATA_FILE_KEY]

    // FIXME not sure if isArray or checking for existence of "length"
    if (Array.isArray(fileParsed)) {
      throw new Error('Trying to parse more than one file.')
    } else {
      const fileContent = fs.readFileSync(fileParsed.path)
      return fileContent
    }
  } catch (error) {
    throw new Error('Error while parsing multipart form (for avatar): ' + error)
  }
}

export default async function _avatarsUploadAPI(
  req: Request,
  res: NextApiResponse
): Promise<void> {
  const { method } = req

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
    const userId = user.id

    switch (method) {
      case 'POST': {
        try {
          const fileParsed = await parseMultipartForm(req)

          // TODO validation?
          // TODO file extension
          // TODO convert png etc.
          await uploadAvatarSupabase(`${userId}.jpg`, fileParsed, req)

          console.log(`[API] uploaded avatar for user ${userId}`)

          /*
           * Using explicit type to make sure we're returning what we've promised in
           * the API function (that called this API endpoint).
           */
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
