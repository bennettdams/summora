import type { PresignedPost } from '@aws-sdk/s3-presigned-post'

// 5 MB
export const maxFileSizeInBytes = 5 * 1024 * 1024
export const validExtensions = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']

export const storageImagesPath = {
  avatar: ({
    userId,
    fileExtension,
  }: {
    userId: string
    fileExtension: string
  }) => `avatars/${userId}.${fileExtension}`,
}

export function checkImageFileExtension(
  fileType: string
):
  | { isValidImageExtension: true; fileExtension: string }
  | { isValidImageExtension: false; fileExtension: null } {
  const fileExtension = extractFileExtensionFromFileType(fileType)

  if (validExtensions.includes(fileExtension)) {
    return {
      isValidImageExtension: true,
      fileExtension,
    }
  } else {
    return {
      isValidImageExtension: false,
      fileExtension: null,
    }
  }
}

export function extractFileExtensionFromFileType(fileType: string): string {
  const fileExtension = fileType.split('/').at(1)

  if (!fileExtension) {
    throw new Error('Cannot extract file extension from file type.')
  } else {
    return fileExtension
  }
}

export async function uploadPresignedPost({
  file,
  presignedPost,
  onSuccess,
}: {
  file: File
  presignedPost: PresignedPost
  onSuccess(): void
}) {
  const { url: presignedUrl, fields } = presignedPost
  const formData = new FormData()

  Object.entries({ ...fields }).forEach(([key, value]) => {
    formData.append(key, value as string)
  })
  formData.set('file', file)

  const upload = await fetch(presignedUrl, {
    method: 'POST',
    body: formData,
  })

  if (upload.ok) {
    console.log('Uploaded successfully.')
    onSuccess()
  } else {
    console.error('Upload failed.')
  }
}

function generateCloudStoragePath({
  storageImageFullPath,
  imageId,
}: {
  storageImageFullPath: string
  imageId: string
}) {
  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME

  if (!bucketName) {
    throw new Error('Missing bucket name')
  } else {
    return `https://${bucketName}.s3.amazonaws.com/${storageImageFullPath}?id=${imageId}`
  }
}

export function generatePublicURLAvatar({
  userId,
  imageId,
  imageFileExtension,
}: {
  userId: string
  imageId: string
  imageFileExtension: string
}): string {
  return generateCloudStoragePath({
    imageId,
    storageImageFullPath: storageImagesPath.avatar({
      userId,
      fileExtension: imageFileExtension,
    }),
  })
}
