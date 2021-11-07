import { useCallback } from 'react'
import { apiAvatarsUpload } from './api-service'
import {
  downloadAvatarSupabase,
  getPublicURLAvatarSupabase,
} from './supabase/supabase-service'

export function useCloudStorage() {
  const uploadAvatar = useCallback(async (picture: File) => {
    return await apiAvatarsUpload(picture)
  }, [])

  const downloadAvatar = useCallback(
    async (
      /**
       * filename & extension, e.g. "example.png"
       */
      filepath: string
    ) => {
      return await downloadAvatarSupabase(filepath)
    },
    []
  )

  const getPublicURLAvatar = useCallback(
    (
      /**
       * filename & extension, e.g. "example.png"
       */
      filepath: string
    ) => {
      return getPublicURLAvatarSupabase(filepath)
    },
    []
  )

  return { uploadAvatar, downloadAvatar, getPublicURLAvatar }
}
