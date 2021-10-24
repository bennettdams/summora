import { useCallback } from 'react'
import { apiAvatarsUpload } from './api'
import { downloadAvatarSupabase } from './supabase/supabase-service'

export function useCloudStorage() {
  const uploadAvatar = useCallback(
    async (
      /**
       * filename & extension, e.g. "example.png"
       */
      filepath: string,
      picture: File
    ) => {
      await apiAvatarsUpload(filepath, picture)
    },
    []
  )

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

  return { uploadAvatar, downloadAvatar }
}
