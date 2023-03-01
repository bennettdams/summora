import type { PresignedPost } from '@aws-sdk/s3-presigned-post'

// 5 MB
export const maxFileSizeInBytes = 5 * 1024 * 1024
export const validExtensions = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']

// export const imageBlurDataURLFallback =
//   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAF+AAABfgHNRE/uAAABQUlEQVR4nAE2Acn+AP//qtGYdK9cP7BsNt6+fv//1ffXab1dAM1wAMpuBQDo0XXVlG2yajyudkeeayzcrknQhRqyYxjbcgDDZg0AvYRJ4KiJxJFn1IxYkFUtcz4Av3EU05VK2p5H6JY1ANecYd6smsiSaeO2kLeWc2hDFKhlHqdxKKh1Lfe0NgDcrlbguaqwgWebfF/mzrLRwKh0WTdKKwBKLQCbYyIAtIA27c/A2rqpf1Q9zrKO69e91cWqm4pvk4FmmYNmAJR1O+O0kuvRvvHXyMicdqWCUdC1ite9mO/jxfXr1ABpTB66e0q9kWvdxKvOs596TyixjVm+m2q8n261m20AJxYAd0kftn5UrYRarYdcuXtNfU0mTz4lxaFouo5IABcAAFI3EMCFVpZhNI1aI8KFSn5OKgAAAD4vKLaTWXVdnITamnILAAAAAElFTkSuQmCC'

export const storageImagesPath = {
  avatar: ({
    userId,
    fileExtension,
  }: {
    userId: string
    fileExtension: string
  }) => `avatars/${userId}.${fileExtension}`,
  postSegmentImage: ({
    postId,
    postSegmentId,
    fileExtension,
  }: {
    postId: string
    postSegmentId: string
    fileExtension: string
  }) => `post-segment-images/${postId}/${postSegmentId}.${fileExtension}`,
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

export function generatePublicURLPostSegmentImage({
  postId,
  postSegmentId,
  imageId,
  imageFileExtension,
}: {
  postId: string
  postSegmentId: string
  imageId: string
  imageFileExtension: string
}): string {
  return generateCloudStoragePath({
    imageId,
    storageImageFullPath: storageImagesPath.postSegmentImage({
      postId,
      postSegmentId,
      fileExtension: imageFileExtension,
    }),
  })
}
