import { NextApiRequest, NextApiResponse } from 'next'
import { useCallback } from 'react'
import {
  deleteAvatarSupabase,
  deletePostSegmentImageSupabase,
  downloadAvatarSupabase,
  downloadPostSegmentImageSupabase,
  getPublicURLAvatarSupabase,
  getPublicURLPostSegmentImageSupabase,
} from './supabase/supabase-service'

export async function deletePostSegmentImageInStorage(params: {
  postId: string
  authorId: string
  imageId: string
  req: NextApiRequest
  res: NextApiResponse
}): Promise<void> {
  return await deletePostSegmentImageSupabase(params)
}

export async function deleteAvatarInStorage(params: {
  userId: string
  imageId: string
  req: NextApiRequest
  res: NextApiResponse
}): Promise<void> {
  return await deleteAvatarSupabase(params)
}

export function useCloudStorage() {
  // const uploadAvatar = useCallback(async (picture: File) => {
  //   return await apiImageUploadAvatars(picture)
  // }, [])

  const downloadAvatar = useCallback(
    async ({ userId, imageId }: { userId: string; imageId: string }) => {
      return await downloadAvatarSupabase({ userId, imageId })
    },
    []
  )

  const getPublicURLAvatar = useCallback(
    ({ userId, imageId }: { userId: string; imageId: string }) => {
      return getPublicURLAvatarSupabase({ userId, imageId })
    },
    []
  )

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
    // uploadAvatar,
    downloadAvatar,
    getPublicURLAvatar,
    downloadPostSegmentImage,
    getPublicURLPostSegmentImage,
  }
}
