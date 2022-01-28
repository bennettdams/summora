import { QueryClient, useQuery } from 'react-query'
import { ApiPosts } from '../pages/api/posts'
import { apiFetchPosts, transformApiPosts } from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'

const queryKey = 'posts'

type QueryData = ApiPosts

/**
 * Liking/unliking a post is done via the `usePost` data hook.
 * This helper is used to keep the query "like" data of `usePosts`'s in sync.
 */
export function syncPostsLikedData(
  queryClient: QueryClient,
  postId: string,
  likedByUpdated: QueryData[number]['likedBy']
) {
  queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
    !prevData
      ? []
      : prevData.map((post) =>
          post.id !== postId
            ? post
            : {
                ...post,
                likedBy: likedByUpdated,
                noOfLikes: likedByUpdated.length,
              }
        )
  )
}

export const hydrationHandler =
  createHydrationHandler<QueryData>(transformApiPosts)

export function prefillServer(queryClient: QueryClient, posts: ApiPosts): void {
  const postsSerialized = hydrationHandler.serialize(posts)
  queryClient.setQueryData([queryKey], postsSerialized)
}

/**
 * Provides data of posts from the API.
 */
export function usePosts() {
  const { isLoading, data } = useQuery<QueryData>(
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
    posts: data ?? [],
  }
}
