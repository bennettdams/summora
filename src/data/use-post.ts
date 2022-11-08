import {
  QueryClient,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'
import { ApiPost } from '../pages/api/posts/[postId]'
import {
  apiCreatePostSegment,
  apiCreatePostSegmentItem,
  apiDeletePostSegment,
  apiFetchPost,
  apiImageUploadPostSegments,
  ApiPostUpdateRequestBody,
  apiUpdatePost,
  transformApiPost,
} from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'
import { trpc } from '../util/trpc'

type QueryData = ApiPost

function createQueryKey(postId: string): QueryKey {
  return ['post', postId]
}

export const hydrationHandler = createHydrationHandler<QueryData>((data) =>
  !data ? null : transformApiPost(data)
)

export function prefillServer(
  queryClient: QueryClient,
  postId: string,
  post: ApiPost
): void {
  const postSerialized = !post ? null : hydrationHandler.serialize(post)
  queryClient.setQueryData<QueryData>(createQueryKey(postId), postSerialized)
}

/**
 * @param enabled `false` is e.g. used by components that just want to like/unlike a post (to not trigger a fetch)
 */
export function usePost(postId: string, enabled = true) {
  const { data, isLoading, isError } = useQuery<QueryData>({
    queryKey: createQueryKey(postId),
    queryFn: async () => (await apiFetchPost(postId)).result ?? null,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled,
  })

  const {
    // post
    updatePostMutation,
    // segment
    createPostSegmentMutation,
    deletePostSegmentMutation,
    updatePostSegmentImageIdMutation,
    // segment item
    createPostSegmentItemMutation,
  } = usePostMutation(postId)

  return {
    post: data ?? null,
    isLoading:
      isLoading ||
      // post
      updatePostMutation.isLoading ||
      // segment
      createPostSegmentMutation.isLoading ||
      deletePostSegmentMutation.isLoading ||
      updatePostSegmentImageIdMutation.isLoading ||
      // segment item
      createPostSegmentItemMutation.isLoading,
    isError:
      isError ||
      // post
      updatePostMutation.isError ||
      // segment
      createPostSegmentMutation.isError ||
      deletePostSegmentMutation.isError ||
      updatePostSegmentImageIdMutation.isError ||
      // segment item
      createPostSegmentItemMutation.isError,
    // TODO really mutateAsync?
    // post
    updatePost: updatePostMutation.mutateAsync,
    // segment
    createPostSegment: createPostSegmentMutation.mutateAsync,
    deletePostSegment: deletePostSegmentMutation.mutateAsync,
    updatePostSegmentImageId: updatePostSegmentImageIdMutation.mutateAsync,
    // segment item
    createPostSegmentItem: createPostSegmentItemMutation.mutateAsync,
  }
}

function usePostMutation(postId: string) {
  const utils = trpc.useContext()
  const queryClient = useQueryClient()
  const [queryKey] = useState<QueryKey>(() => createQueryKey(postId))

  // POST
  const updatePostMutation = useMutation(apiUpdatePost, {
    onMutate: async ({
      postToUpdate,
    }: {
      postToUpdate: ApiPostUpdateRequestBody
    }) => {
      // cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKey)

      // snapshot the previous value
      const postBeforeMutation = queryClient.getQueryData<QueryData>(queryKey)

      // optimistically update to the new value
      if (postBeforeMutation) {
        const postForOptimisticUpdate: QueryData = {
          ...postBeforeMutation,
        }

        /*
         * TODO include other fields like category & tags.
         * Right now, this does not work because the update object only has their IDs
         * (like categoryId), but the post state expects an object (e.g. category including title).
         */
        if (postToUpdate.title && typeof postToUpdate.title === 'string')
          postForOptimisticUpdate.title = postToUpdate.title
        if (postToUpdate.subtitle && typeof postToUpdate.subtitle === 'string')
          postForOptimisticUpdate.subtitle = postToUpdate.subtitle

        queryClient.setQueryData<QueryData>(queryKey, postForOptimisticUpdate)
      }

      /*
       * This return will be used in `onError` as `context`.
       * We put the post before the mutation here, so it can be used to reset
       * the state when an error occurs.
       */
      return { postBeforeMutation }
    },
    onError: (err, _, context) => {
      const postBeforeMutation = context?.postBeforeMutation
      if (postBeforeMutation) {
        queryClient.setQueryData<QueryData>(queryKey, postBeforeMutation)
      }
      console.error('Error while updating post:', err)
    },
    onSuccess: (data) => {
      if (data.result) {
        queryClient.setQueryData<QueryData>(queryKey, data.result)
      }
    },
  })

  // SEGMENT
  const createPostSegmentMutation = useMutation(apiCreatePostSegment, {
    onSuccess: (data) => {
      if (data.result) {
        const segmentNew = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                segments: [...prevData.segments, segmentNew],
              }
        )
      }
    },
  })

  // TODO missing deletion in `usePosts`' cache
  const deletePostSegmentMutation = useMutation(apiDeletePostSegment, {
    onSuccess: (data, deletedPostSegmentId) => {
      // true = was deleted
      if (data.result === true) {
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                segments: prevData.segments.filter(
                  (segment) => segment.id !== deletedPostSegmentId
                ),
              }
        )
      }
    },
  })

  const updatePostSegmentImageIdMutation = useMutation(
    apiImageUploadPostSegments,
    {
      onSuccess: () => {
        utils.postSegments.byPostId.invalidate({ postId })
      },
    }
  )

  // ITEM
  const createPostSegmentItemMutation = useMutation(apiCreatePostSegmentItem, {
    onSuccess: (data) => {
      if (data.result) {
        const segmentItemNew = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                segments: prevData.segments.map((segment) =>
                  segment.id !== segmentItemNew.postSegmentId
                    ? segment
                    : { ...segment, items: [...segment.items, segmentItemNew] }
                ),
              }
        )
      }
    },
  })

  return {
    // post
    updatePostMutation,
    // segment
    createPostSegmentMutation,
    deletePostSegmentMutation,
    updatePostSegmentImageIdMutation,
    // segment item
    createPostSegmentItemMutation,
  }
}
