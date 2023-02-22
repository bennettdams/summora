import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost as createPresignedPostAWS } from '@aws-sdk/s3-presigned-post'
import {
  checkImageFileExtension,
  maxFileSizeInBytes,
  storageImagesPath,
} from '../services/cloud-service'
import { serverOnly } from '../util/utils'

function getS3ClientConfig() {
  const accessKeyId = process.env.S3_ACCESS_KEY
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  const region = process.env.S3_REGION
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME

  if (!accessKeyId || !secretAccessKey || !region || !bucket) {
    throw new Error('Missing S3 config from env')
  } else {
    return {
      accessKeyId,
      secretAccessKey,
      region,
      bucket,
    }
  }
}

export async function createPresignedPost({
  userId,
  fileType,
}: {
  userId: string
  fileType: string
}) {
  serverOnly()

  const s3Config = getS3ClientConfig()

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
    region: s3Config.region,
  })

  const expiryInSeconds = 60

  const { fileExtension, isValidImageExtension } =
    checkImageFileExtension(fileType)

  if (!isValidImageExtension) throw new Error('Invalid file image extension')

  return await createPresignedPostAWS(s3Client, {
    Key: storageImagesPath.avatar({ userId, fileExtension }),
    Bucket: s3Config.bucket,
    Fields: {
      'Content-Type': fileType,
    },
    Conditions: [
      ['starts-with', '$Content-Type', 'image/'],
      ['content-length-range', 10, maxFileSizeInBytes],
    ],
    Expires: expiryInSeconds,
  })
}
