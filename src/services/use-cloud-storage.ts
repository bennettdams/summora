import { useCallback } from 'react'
import { apiImageUploadAvatars } from './api-service'
import {
  downloadAvatarSupabase,
  downloadPostSegmentImageSupabase,
  getPublicURLAvatarSupabase,
  getPublicURLPostSegmentImageSupabase,
} from './supabase/supabase-service'

export function useCloudStorage() {
  const uploadAvatar = useCallback(async (picture: File) => {
    return await apiImageUploadAvatars(picture)
  }, [])

  const downloadAvatar = useCallback(async (userId: string) => {
    return await downloadAvatarSupabase(userId)
  }, [])

  const getPublicURLAvatar = useCallback((userId: string) => {
    return getPublicURLAvatarSupabase(userId)
  }, [])

  const downloadPostSegmentImage = useCallback(
    async ({
      postId,
      authorId,
      imageId,
    }: {
      postId: string
      authorId: string
      imageId: string
    }) => {
      return await downloadPostSegmentImageSupabase({
        postId,
        authorId,
        imageId,
      })
    },
    []
  )

  const getPublicURLPostSegmentImage = useCallback(
    ({
      postId,
      authorId,
      imageId,
    }: {
      postId: string
      authorId: string
      imageId: string
    }) => {
      return getPublicURLPostSegmentImageSupabase({ postId, authorId, imageId })
    },
    []
  )

  return {
    uploadAvatar,
    downloadAvatar,
    getPublicURLAvatar,
    downloadPostSegmentImage,
    getPublicURLPostSegmentImage,
  }
}
