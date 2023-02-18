import type { PresignedPost } from '@aws-sdk/s3-presigned-post'

// 5 MB
export const maxFileSizeInBytes = 5 * 1024 * 1024
export const validExtensions = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']
