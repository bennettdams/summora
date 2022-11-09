import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiImageUploadAvatars } from '../services/api-service'
import { trpc } from '../util/trpc'
import { queryKey as queryKeyPosts } from './use-posts'

export function useOwnUser(userId: string) {
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
    onSuccess: () => {
      // USER DATA
      utils.user.byUserId.invalidate({ userId })

      // USER POSTS DATA
      utils.userPosts.byUserId.invalidate({ userId })

      // POSTS DATA
      queryClient.invalidateQueries(queryKeyPosts)
    },
  })

  return { updateUserImageIdMutation }
}
