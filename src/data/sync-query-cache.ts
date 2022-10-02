import { QueryClient } from '@tanstack/react-query'
import { trpc } from '../util/trpc'
import {
  QueryData as QueryDataPosts,
  queryKey as queryKeyPosts,
} from './use-posts'

/**
 * Liking/unliking a post is done via the `usePost` data hook.
 * This helper syncs this new "like" data with `usePosts` and `useUserPosts`.
 */
export function useSyncLikedData() {
  const utils = trpc.useContext()

  function syncPostsLikedData({
    queryClient,
    postId,
    userId,
    likedByUpdated,
  }: {
    queryClient: QueryClient
    postId: string
    userId: string
    likedByUpdated: {
      userId: string
    }[]
  }) {
    // POSTS
    queryClient.setQueryData<QueryDataPosts>(queryKeyPosts, (prevData) =>
      !prevData
        ? []
        : prevData.map((post) =>
            post.id !== postId
              ? post
              : {
                  ...post,
                  likedBy: likedByUpdated,
                  _count: {
                    ...post._count,
                    likedBy: likedByUpdated.length,
                  },
                }
          )
    )

    // USER POSTS
    utils.userPosts.byUserId.setData(
      (prevData) =>
        !prevData
          ? []
          : prevData.map((post) =>
              post.id !== postId
                ? post
                : {
                    ...post,
                    likedBy: likedByUpdated,
                    _count: {
                      ...post._count,
                      likedBy: likedByUpdated.length,
                    },
                  }
            ),
      { userId }
    )
  }

  return { syncPostsLikedData }
}
