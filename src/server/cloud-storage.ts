import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost as createPresignedPostAWS } from '@aws-sdk/s3-presigned-post'
import { maxFileSizeInBytes } from '../services/cloud-service'

function getS3ClientConfig() {
  const accessKeyId = process.env.S3_ACCESS_KEY
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  const region = process.env.S3_REGION
  const bucket = process.env.S3_BUCKET_NAME

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

export async function createPresignedPost(fileType: string) {
  const s3Config = getS3ClientConfig()

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
    region: s3Config.region,
  })

  const expiryInSeconds = 60

  return await createPresignedPostAWS(s3Client, {
    Key: 'avatars/test4234324.jpg',
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
