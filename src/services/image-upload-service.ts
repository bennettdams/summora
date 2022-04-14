import { NextApiRequest } from 'next'
import fs from 'fs'
import { Files, IncomingForm } from 'formidable'
import { FORM_DATA_FILE_KEY } from '../util/http'
import sharp from 'sharp'
import { validExtensions } from '../components/ImageUpload'

const validMimeTypes = validExtensions.map((extension) => `image/${extension}`)

const maxImageWidthPx = 1920
const maxImageHeightPx = 1080

/**
 * Parses, optimizes & converts an image from request's multipart form data.
 */
export async function convertImageForUpload(
  req: NextApiRequest
): Promise<Buffer> {
  const fileParsed = await parseMultipartForm(req)
  const fileOptimizedAndConverted = await optimizeAndConvertImage(fileParsed)

  return fileOptimizedAndConverted
}

/**
 * Takes image and
 *  - resizes to a max width or max height, based on what exceeds the limit
 *  - converts the image to JPEG with lower quality
 */
export async function optimizeAndConvertImage(
  fileParsed: Buffer
): Promise<Buffer> {
  return await sharp(fileParsed)
    // resized when width or height exceed limit
    .resize(maxImageWidthPx, maxImageHeightPx, { withoutEnlargement: true })
    .jpeg({
      quality: 80,
    })
    .toBuffer()
}

/**
 * Parse file form request payload.
 * This only works for a single file in the form data.
 */
export async function parseMultipartForm(req: NextApiRequest): Promise<Buffer> {
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
        const mimeType = part.mimetype

        if (!mimeType) {
          return reject(new Error('File has no MIME type.'))
        } else if (!validMimeTypes.includes(mimeType)) {
          return reject(new Error(`MIME type ${mimeType} is not supported.`))
        } else {
          // needed to actually use the part
          form._handlePart(part)
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
      const fileContent = fs.readFileSync(fileParsed.filepath)
      return fileContent
    }
  } catch (error) {
    throw new Error('Error while parsing multipart form: ' + error)
  }
}
