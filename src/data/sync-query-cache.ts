import { QueryClient } from 'react-query'
import { ApiPosts } from '../pages/api/posts'
import { ApiUserPosts } from '../pages/api/users/[userId]/posts'
import { queryKey } from './use-posts'
import { createQueryKey } from './use-user-posts'

type QueryData = ApiPosts | ApiUserPosts

function createQueryKeys(userId: string) {
  return [queryKey, createQueryKey(userId)]
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
