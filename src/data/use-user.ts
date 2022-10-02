import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiImageUploadAvatars } from '../services/api-service'
import { trpc } from '../util/trpc'
import {
  QueryData as QueryDataPosts,
  queryKey as queryKeyPosts,
} from './use-posts'

export function useUser(userId: string) {
  const { data, isLoading, isError } = trpc.user.byUserId.useQuery(
    { userId },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      keepPreviousData: true,
    }
  )

  const { updateUserImageIdMutation } = useUserMutation(userId)

  return {
    user: data ?? null,
    isLoading: isLoading || updateUserImageIdMutation.isLoading,
    isError: isError || updateUserImageIdMutation.isError,
    updateUserImageId: updateUserImageIdMutation.mutateAsync,
  }
}

function useUserMutation(userId: string) {
  const utils = trpc.useContext()
  const queryClient = useQueryClient()

  const updateUserImageIdMutation = useMutation(apiImageUploadAvatars, {
    onSuccess: (data) => {
      if (data.result) {
        const newImageData = data.result

        // USER DATA
        utils.user.byUserId.setData(
          (prevData) =>
            !prevData ? undefined : { ...prevData, ...newImageData },
          { userId }
        )

        // USER POSTS DATA
        utils.userPosts.byUserId.setData(
          (prevData) =>
            !prevData
              ? undefined
              : prevData.map((post) => ({
                  ...post,
                  author: {
                    ...post.author,
                    imageId: newImageData.imageId,
                    imageBlurDataURL: newImageData.imageBlurDataURL,
                  },
                })),
          { userId }
        )

        // POSTS DATA
        queryClient.setQueryData<QueryDataPosts>(queryKeyPosts, (prevData) =>
          !prevData
            ? undefined
            : prevData.map((post) => ({
                ...post,
                author: {
                  ...post.author,
                  imageId: newImageData.imageId,
                  imageBlurDataURL: newImageData.imageBlurDataURL,
                },
              }))
        )
      }
    },
  })

  return { updateUserImageIdMutation }
}
