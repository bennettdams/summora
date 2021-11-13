import { QueryClient, useQuery } from 'react-query'
import { ApiPosts } from '../pages/api/posts'
import { apiFetchPosts, transformApiPosts } from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'

const queryKey = 'posts'

export type PostsQueryData = ApiPosts

export const hydrationHandler =
  createHydrationHandler<PostsQueryData>(transformApiPosts)

export function prefillServer(queryClient: QueryClient, posts: ApiPosts): void {
  const postsSerialized = hydrationHandler.serialize(posts)
  queryClient.setQueryData([queryKey], postsSerialized)
}

/**
 * Provides data of posts from the API.
 */
export function usePosts(): {
  isLoading: boolean
  isFetching: boolean
  posts: ApiPosts
} {
  const { isLoading, isFetching, data } = useQuery<PostsQueryData>(
    [queryKey],
    async () => (await apiFetchPosts()).result ?? [],
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )

  return {
    isLoading,
    isFetching,
    posts: data ?? [],
  }
}
