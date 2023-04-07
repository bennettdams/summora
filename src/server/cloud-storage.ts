import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'
import { createPresignedPost as createPresignedPostAWS } from '@aws-sdk/s3-presigned-post'
import {
  checkImageFileExtension,
  maxFileSizeInBytes,
  storageFolderPaths,
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

function newS3Client() {
  const s3Config = getS3ClientConfig()

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
    region: s3Config.region,
  })

  return { s3Client, s3Config }
}

/**
 * Delete a folder with all its files and subfolders.
 * @param folderPath without trailing slash
 */
async function deleteFolder(folderPath: string): Promise<{ ok: boolean }> {
  try {
    const { bucket: bucketName } = getS3ClientConfig()

    const folderPathSanitizedForTrailingSlash = folderPath.endsWith('/')
      ? folderPath.slice(0, -1)
      : folderPath
    /**
     * The trailing slash in the folder path is necessary to ensure that only objects within that specific folder
     * (and not objects with similar prefixes) are returned by the `listObjectsV2` method.
     */
    const folderPathWithTrailingSlash = `${folderPathSanitizedForTrailingSlash}/`

    const listParams = {
      Bucket: bucketName,
      Prefix: folderPathWithTrailingSlash,
    }

    const { s3Client } = newS3Client()

    const listResponse = await s3Client.send(
      new ListObjectsV2Command(listParams)
    )

    if (!listResponse.Contents) {
      console.info('Wanted to delete, but folder is empty')
      return { ok: false }
    } else {
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listResponse.Contents.map(({ Key }) => ({ Key })),
          Quiet: false,
        },
      }

      const res = await s3Client.send(new DeleteObjectsCommand(deleteParams))

      // a 200 response status code does not really mean that the delete operation was succesful, only the request...
      if (res.$metadata.httpStatusCode !== 200) {
        throw new Error('Something went wrong while deleting')
      } else if (!!res.Errors && res.Errors.length > 0) {
        const err = res.Errors.at(0)
        throw new Error(err?.Message ?? 'Something went wrong while deleting')
      } else {
        if (!res.Deleted) {
          throw new Error(
            'Deletion request was succesful, but nothing was deleted.'
          )
        } else {
          return {
            ok: true,
          }
        }
      }
    }
  } catch (error) {
    console.error('Error while deleting folder:', error)
    return { ok: false }
  }
}

export async function createPresignedPost({
  fileType,
  storageImagePath,
}: {
  fileType: string
  storageImagePath: string
}) {
  serverOnly()

  const { s3Client, s3Config } = newS3Client()

  const expiryInSeconds = 60

  const { isValidImageExtension } = checkImageFileExtension(fileType)

  if (!isValidImageExtension) throw new Error('Invalid file image extension')

  return await createPresignedPostAWS(s3Client, {
    Key: storageImagePath,
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

export async function deletePostInStorage(postId: string) {
  return await deleteFolder(storageFolderPaths.post(postId))
}

export async function deletePostSegmentImageInStorage({
  postId,
  postSegmentId,
}: {
  postId: string
  postSegmentId: string
}) {
  return await deleteFolder(
    storageFolderPaths.postSegmentImage({ postId, postSegmentId })
  )
}

export async function deleteAvatarInStorage(userId: string) {
  return await deleteFolder(storageFolderPaths.avatar(userId))
}
