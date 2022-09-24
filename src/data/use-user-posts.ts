import { QueryClient, QueryKey, useQuery } from '@tanstack/react-query'
import { ApiUserPosts } from '../pages/api/users/[userId]/posts'
import { apiFetchUserPosts, transformApiPosts } from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'

export function createQueryKey(userId: string): QueryKey {
  return ['user-posts', userId]
}

type QueryData = ApiUserPosts

export const hydrationHandler =
  createHydrationHandler<QueryData>(transformApiPosts)

export function prefillServer({
  queryClient,
  posts,
  userId,
}: {
  queryClient: QueryClient
  posts: ApiUserPosts
  userId: string
}): void {
  const postsSerialized = hydrationHandler.serialize(posts)
  queryClient.setQueryData(createQueryKey(userId), postsSerialized)
}

/**
 * Provides data of user posts from the API.
 */
export function useUserPosts(userId: string) {
  const { isLoading, data } = useQuery<QueryData>(
    createQueryKey(userId),
    async () => (await apiFetchUserPosts(userId)).result ?? [],
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )

  return {
    isLoading,
    posts: data ?? [],
  }
}
