import { useCallback } from 'react'
import { apiAvatarsUpload } from './api'
import { downloadFileSupabase } from './supabase/supabase-service'

export function useCloudStorage() {
  const uploadAvatar = useCallback(
    async (
      /**
       * filename & extension, e.g. "example.png"
       */
      filepath: string,
      picture: Blob
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
      return await downloadFileSupabase(filepath)
    },
    []
  )

  return { uploadAvatar, downloadAvatar }
}
