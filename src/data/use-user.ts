import { useMutation } from '@tanstack/react-query'
import { apiImageUploadAvatars } from '../services/api-service'
import { trpc } from '../util/trpc'

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

  const updateUserImageIdMutation = useMutation(apiImageUploadAvatars, {
    onSuccess: (data) => {
      if (data.result) {
        const newImageData = data.result
        utils.user.byUserId.setData(
          (prevData) =>
            !prevData ? undefined : { ...prevData, ...newImageData },
          { userId }
        )
      }
    },
  })

  return { updateUserImageIdMutation }
}
