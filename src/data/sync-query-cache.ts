import { QueryClient, QueryKey } from 'react-query'
import { ApiPosts } from '../pages/api/posts'
import { ApiUserPosts } from '../pages/api/users/[userId]/posts'
import { queryKey as queryKeyPosts } from './use-posts'
import { createQueryKey as createQueryKeyUserPosts } from './use-user-posts'

type QueryData = ApiPosts | ApiUserPosts

/**
 * This returns a query key array, because we don't want to use it as a query key.
 * Rather, we want to have an array of queries that are both synced - here: posts and user posts.
 */
function createQueryKeys(userId: string): QueryKey[] {
  return [queryKeyPosts, createQueryKeyUserPosts(userId)]
}

/**
 * Liking/unliking a post is done via the `usePost` data hook.
 * This helper is used to keep the query "like" data of `usePosts`'s in sync.
 */
export function syncPostsLikedData({
  queryClient,
  postId,
  userId,
  likedByUpdated,
}: {
  queryClient: QueryClient
  postId: string
  userId: string
  likedByUpdated: QueryData[number]['likedBy']
}) {
  const keys = createQueryKeys(userId)
  keys.forEach((queryKey) => {
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
  })
}
