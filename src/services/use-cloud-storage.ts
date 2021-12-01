import { useCallback } from 'react'
import { apiAvatarsUpload } from './api-service'
import {
  downloadAvatarSupabase,
  downloadPostSegmentImageSupabase,
  getPublicURLAvatarSupabase,
  getPublicURLPostSegmentImageSupabase,
} from './supabase/supabase-service'

export function useCloudStorage() {
  const uploadAvatar = useCallback(async (picture: File) => {
    return await apiAvatarsUpload(picture)
  }, [])

  const downloadAvatar = useCallback(async (userId: string) => {
    return await downloadAvatarSupabase(userId)
  }, [])

  const getPublicURLAvatar = useCallback((userId: string) => {
    return getPublicURLAvatarSupabase(userId)
  }, [])

  const uploadPostSegmentImage = useCallback(async (picture: File) => {
    return await apiAvatarsUpload(picture)
  }, [])

  const downloadPostSegmentImage = useCallback(
    async (postId: string, postSegmentId: string) => {
      return await downloadPostSegmentImageSupabase(postId, postSegmentId)
    },
    []
  )

  const getPublicURLPostSegmentImage = useCallback(
    (postId: string, postSegmentId: string) => {
      return getPublicURLPostSegmentImageSupabase(postId, postSegmentId)
    },
    []
  )

  return {
    uploadAvatar,
    downloadAvatar,
    getPublicURLAvatar,
    uploadPostSegmentImage,
    downloadPostSegmentImage,
    getPublicURLPostSegmentImage,
  }
}
