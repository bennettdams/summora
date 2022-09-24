import { QueryClient, QueryKey, useQuery } from '@tanstack/react-query'
import { ApiPosts } from '../pages/api/posts'
import { apiFetchPosts, transformApiPosts } from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'

export const queryKey: QueryKey = ['posts']

type QueryData = ApiPosts

export const hydrationHandler =
  createHydrationHandler<QueryData>(transformApiPosts)

export function prefillServer(queryClient: QueryClient, posts: ApiPosts): void {
  const postsSerialized = hydrationHandler.serialize(posts)
  queryClient.setQueryData(queryKey, postsSerialized)
}

/**
 * Provides data of posts from the API.
 */
export function usePosts() {
  const { isLoading, data } = useQuery<QueryData>(
    queryKey,
    async () => (await apiFetchPosts()).result ?? [],
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
