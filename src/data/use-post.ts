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
  apiDeletePostSegmentItem,
  apiFetchPost,
  apiImageUploadPostSegments,
  ApiPostUpdateRequestBody,
  apiUpdatePost,
  apiUpdatePostSegment,
  apiUpdatePostSegmentItem,
  transformApiPost,
} from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'

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
  const { data, isLoading, isError } = useQuery<QueryData>(
    createQueryKey(postId),
    async () => (await apiFetchPost(postId)).result ?? null,
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      enabled,
    }
  )

  const {
    // post
    updatePostMutation,
    // segment
    createPostSegmentMutation,
    updatePostSegmentMutation,
    deletePostSegmentMutation,
    updatePostSegmentImageIdMutation,
    // segment item
    createPostSegmentItemMutation,
    updatePostSegmentItemMutation,
    deletePostSegmentItemMutation,
  } = usePostMutation(postId)

  return {
    post: data ?? null,
    isLoading:
      isLoading ||
      // post
      updatePostMutation.isLoading ||
      // segment
      createPostSegmentMutation.isLoading ||
      updatePostSegmentMutation.isLoading ||
      deletePostSegmentMutation.isLoading ||
      updatePostSegmentImageIdMutation.isLoading ||
      // segment item
      createPostSegmentItemMutation.isLoading ||
      updatePostSegmentItemMutation.isLoading ||
      deletePostSegmentItemMutation.isLoading,
    isError:
      isError ||
      // post
      updatePostMutation.isError ||
      // segment
      createPostSegmentMutation.isError ||
      updatePostSegmentMutation.isError ||
      deletePostSegmentMutation.isError ||
      updatePostSegmentImageIdMutation.isError ||
      // segment item
      createPostSegmentItemMutation.isError ||
      updatePostSegmentItemMutation.isError ||
      deletePostSegmentItemMutation.isError,
    // TODO really mutateAsync?
    // post
    updatePost: updatePostMutation.mutateAsync,
    // segment
    createPostSegment: createPostSegmentMutation.mutateAsync,
    updatePostSegment: updatePostSegmentMutation.mutateAsync,
    deletePostSegment: deletePostSegmentMutation.mutateAsync,
    updatePostSegmentImageId: updatePostSegmentImageIdMutation.mutateAsync,
    // segment item
    createPostSegmentItem: createPostSegmentItemMutation.mutateAsync,
    updatePostSegmentItem: updatePostSegmentItemMutation.mutateAsync,
    deletePostSegmentItem: deletePostSegmentItemMutation.mutateAsync,
  }
}

function usePostMutation(postId: string) {
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

  const updatePostSegmentMutation = useMutation(apiUpdatePostSegment, {
    onSuccess: (data) => {
      if (data.result) {
        const segmentUpdated = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                segments: prevData.segments.map((segment) =>
                  segment.id === segmentUpdated.id ? segmentUpdated : segment
                ),
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
      onSuccess: (data) => {
        if (data.result) {
          const segmentNewImageId = data.result
          queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
            !prevData
              ? null
              : {
                  ...prevData,
                  segments: prevData.segments.map((segment) =>
                    segment.id === segmentNewImageId.id
                      ? { ...segment, imageId: segmentNewImageId.imageId }
                      : segment
                  ),
                }
          )
        }
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

  const updatePostSegmentItemMutation = useMutation(apiUpdatePostSegmentItem, {
    onSuccess: (data) => {
      if (data.result) {
        const segmentItemUpdated = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                segments: prevData.segments.map((segment) =>
                  segment.id !== segmentItemUpdated.postSegmentId
                    ? segment
                    : {
                        ...segment,
                        items: segment.items.map((item) =>
                          item.id === segmentItemUpdated.id
                            ? segmentItemUpdated
                            : item
                        ),
                      }
                ),
              }
        )
      }
    },
  })

  const deletePostSegmentItemMutation = useMutation(apiDeletePostSegmentItem, {
    onSuccess: (data, deletedPostSegmentItemId) => {
      // true = was deleted
      if (data.result === true) {
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                segments: prevData.segments.map((segment) => ({
                  ...segment,
                  items: segment.items.filter(
                    (item) => item.id !== deletedPostSegmentItemId
                  ),
                })),
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
    updatePostSegmentMutation,
    deletePostSegmentMutation,
    updatePostSegmentImageIdMutation,
    // segment item
    createPostSegmentItemMutation,
    updatePostSegmentItemMutation,
    deletePostSegmentItemMutation,
  }
}
