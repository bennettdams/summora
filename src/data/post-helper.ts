import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  apiCreatePostSegment,
  apiCreatePostSegmentItem,
  apiFetchPost,
  apiUpdatePost,
  apiUpdatePostSegment,
  apiUpdatePostSegmentItem,
} from '../services/api-service'
import { ApiPost } from '../pages/api/posts/[postId]'
import { useState } from 'react'

const queryKeyPostBase = 'post'
type QueryData = ApiPost | null

function createQueryKey(postId: string) {
  return [queryKeyPostBase, postId]
}

// function usePostsMutation() {
//   const queryClient = useQueryClient()

//   const createPostMutation = useMutation(createPost, {
//     onSuccess: () => {
//       queryClient.invalidateQueries(queryKeyPosts)
//     },
//   })

//   return { createPostMutation }
// }

function usePostMutation(postId: string) {
  const queryClient = useQueryClient()
  const [queryKey] = useState(createQueryKey(postId))

  // POST
  const updatePostMutation = useMutation(apiUpdatePost, {
    onSuccess: (data) => {
      if (data.result) {
        queryClient.setQueryData<QueryData>(queryKey, data.result)
      }
    },
  })

  // SEGMENT
  const createPostSegmentMutation = useMutation(apiCreatePostSegment, {
    // https://react-query.tanstack.com/guides/optimistic-updates

  const updatePostMutation = useMutation(apiUpdatePost, {
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

  return {
    updatePostMutation,
    createPostSegmentItemMutation,
    updatePostSegmentItemMutation,
    createPostSegmentMutation,
    updatePostSegmentMutation,
  }
}

// export function usePosts() {
//   const { data, isLoading, isError } = useQuery<PostPostsAPI[]>(
//     queryKeyPosts,
//     fetchPosts
//   )
//   const { createPostMutation } = usePostsMutation()

//   return {
//     posts: data || null,
//     isLoading,
//     isError,
//     createPost: createPostMutation.mutate,
//   }
// }

export function usePost(postId: string, enabled = true) {
  const { data, isLoading, isError } = useQuery<QueryData>(
    createQueryKey(postId),
    async () => (await apiFetchPost(postId)).result ?? null,
    { enabled }
  )

  const {
    updatePostMutation,
    createPostSegmentItemMutation,
    updatePostSegmentItemMutation,
    createPostSegmentMutation,
    updatePostSegmentMutation,
  } = usePostMutation(postId)

  return {
    post: data ?? null,
    isLoading:
      isLoading ||
      updatePostMutation.isLoading ||
      createPostSegmentItemMutation.isLoading ||
      updatePostSegmentItemMutation.isLoading ||
      createPostSegmentMutation.isLoading ||
      updatePostSegmentMutation.isLoading,
    isError:
      isError ||
      updatePostMutation.isError ||
      createPostSegmentItemMutation.isError ||
      updatePostSegmentItemMutation.isError ||
      createPostSegmentMutation.isError ||
      updatePostSegmentMutation.isError,
    updatePost: updatePostMutation.mutateAsync,
    createPostSegmentItem: createPostSegmentItemMutation.mutateAsync,
    createPostSegment: createPostSegmentMutation.mutateAsync,
    updatePostSegmentItem: updatePostSegmentItemMutation.mutateAsync,
    updatePostSegment: updatePostSegmentMutation.mutateAsync,
  }
}
