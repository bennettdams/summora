import {
  QueryClient,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'
import { ApiUser } from '../pages/api/users/[userId]'
import {
  apiFetchUser,
  apiImageUploadAvatars,
  apiUpdateUser,
  transformApiUser,
} from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'

const queryKeyUserBase = 'user'
type QueryData = ApiUser

function createQueryKey(userId: string): QueryKey {
  return [queryKeyUserBase, userId]
}

export const hydrationHandler = createHydrationHandler<QueryData>((data) =>
  !data ? null : transformApiUser(data)
)

export function prefillServer(
  queryClient: QueryClient,
  userId: string,
  user: ApiUser
): void {
  const userSerialized = !user ? null : hydrationHandler.serialize(user)
  queryClient.setQueryData<QueryData>(createQueryKey(userId), userSerialized)
}

export function useUser(userId: string) {
  const { data, isLoading, isError } = useQuery<QueryData>(
    createQueryKey(userId),
    async () => (await apiFetchUser(userId)).result ?? null,
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      keepPreviousData: true,
    }
  )

  const { updateUserImageIdMutation, updateUserMutation } =
    useUserMutation(userId)

  return {
    user: data ?? null,
    isLoading:
      isLoading ||
      updateUserImageIdMutation.isLoading ||
      updateUserMutation.isLoading,
    isError:
      isError ||
      updateUserImageIdMutation.isError ||
      updateUserMutation.isError,
    updateUserImageId: updateUserImageIdMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
  }
}

function useUserMutation(userId: string) {
  const queryClient = useQueryClient()
  const [queryKey] = useState<QueryKey>(createQueryKey(userId))

  const updateUserImageIdMutation = useMutation(apiImageUploadAvatars, {
    onSuccess: (data) => {
      if (data.result) {
        const userUpdated = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                ...userUpdated,
              }
        )
      }
    },
  })

  const updateUserMutation = useMutation(apiUpdateUser, {
    onSuccess: (data) => {
      if (data.result) {
        const userUpdated = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                ...userUpdated,
              }
        )
      }
    },
  })

  return { updateUserImageIdMutation, updateUserMutation }
}
