import { QueryClient, useQuery } from 'react-query'
import { ApiUser } from '../pages/api/users/[userId]'
import { createHydrationHandler } from '../services/hydration-service'
import { apiFetchUser, transformApiUser } from '../services/api-service'

const queryKeyUserBase = 'user'
type QueryData = ApiUser

function createQueryKey(userId: string) {
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

  return {
    user: data ?? null,
    isLoading: isLoading,
    isError: isError,
  }
}
