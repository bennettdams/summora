import {
  QueryClient,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query'
import { ApiUser } from '../pages/api/users/[userId]'
import { createHydrationHandler } from '../services/hydration-service'
import {
  apiFetchUser,
  apiImageUploadAvatars,
  transformApiUser,
} from '../services/api-service'
import { useState } from 'react'

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
  queryClient.setQueryData(createQueryKey(userId), userSerialized)
}

export function useUser(userId: string) {
  const { data, isLoading, isError } = useQuery<QueryData>(
    createQueryKey(userId),
    async () => (await apiFetchUser(userId)).result ?? null,
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
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
  const queryClient = useQueryClient()
  const [queryKey] = useState(createQueryKey(userId))

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

  return { updateUserImageIdMutation }
}
