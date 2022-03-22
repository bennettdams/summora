import { QueryClient, useMutation, useQuery, useQueryClient } from 'react-query'
import {
  apiCreatePostComment,
  apiCreatePostSegment,
  apiCreatePostSegmentItem,
  apiDeletePostComment,
  apiDownvotePostComment,
  apiFetchPost,
  apiImageUploadPostSegments,
  apiLikeUnlikePost,
  ApiPostUpdateRequestBody,
  apiUpdatePost,
  apiUpdatePostSegment,
  apiUpdatePostSegmentItem,
  apiUpvotePostComment,
  transformApiPost,
} from '../services/api-service'
import { ApiPost } from '../pages/api/posts/[postId]'
import { useState } from 'react'
import { createHydrationHandler } from '../services/hydration-service'
import { syncPostsLikedData } from './use-posts'
import { useAuth } from '../services/auth-service'

const queryKeyPostBase = 'post'
type QueryData = ApiPost

function createQueryKey(postId: string) {
  return [queryKeyPostBase, postId]
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
  queryClient.setQueryData(createQueryKey(postId), postSerialized)
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
    updatePostMutation,
    createPostSegmentItemMutation,
    updatePostSegmentItemMutation,
    updatePostSegmentImageIdMutation,
    createPostSegmentMutation,
    updatePostSegmentMutation,
    createPostCommentMutation,
    deletePostCommentMutation,
    likeUnlikePostMutation,
    upvotePostCommentMutation,
    downvotePostCommentMutation,
  } = usePostMutation(postId)

  return {
    post: data ?? null,
    isLoading:
      isLoading ||
      updatePostMutation.isLoading ||
      createPostSegmentItemMutation.isLoading ||
      updatePostSegmentItemMutation.isLoading ||
      updatePostSegmentImageIdMutation.isLoading ||
      createPostSegmentMutation.isLoading ||
      updatePostSegmentMutation.isLoading ||
      createPostCommentMutation.isLoading ||
      deletePostCommentMutation.isLoading ||
      likeUnlikePostMutation.isLoading ||
      upvotePostCommentMutation.isLoading ||
      downvotePostCommentMutation.isLoading,
    isError:
      isError ||
      updatePostMutation.isError ||
      createPostSegmentItemMutation.isError ||
      updatePostSegmentItemMutation.isError ||
      updatePostSegmentImageIdMutation.isError ||
      createPostSegmentMutation.isError ||
      updatePostSegmentMutation.isError ||
      createPostCommentMutation.isError ||
      deletePostCommentMutation.isError ||
      likeUnlikePostMutation.isError ||
      upvotePostCommentMutation.isError ||
      downvotePostCommentMutation.isError,
    // TODO really mutateAsync?
    updatePost: updatePostMutation.mutateAsync,
    createPostSegmentItem: createPostSegmentItemMutation.mutateAsync,
    createPostSegment: createPostSegmentMutation.mutateAsync,
    updatePostSegmentItem: updatePostSegmentItemMutation.mutateAsync,
    updatePostSegment: updatePostSegmentMutation.mutateAsync,
    updatePostSegmentImageId: updatePostSegmentImageIdMutation.mutateAsync,
    createPostComment: createPostCommentMutation.mutateAsync,
    deletePostComment: deletePostCommentMutation.mutateAsync,
    likeUnlikePost: likeUnlikePostMutation.mutateAsync,
    upvotePostComment: upvotePostCommentMutation.mutateAsync,
    downvotePostComment: downvotePostCommentMutation.mutateAsync,
  }
}

function usePostMutation(postId: string) {
  const { userId } = useAuth()
  const queryClient = useQueryClient()
  const [queryKey] = useState(() => createQueryKey(postId))

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

  const updatePostSegmentImageIdMutation = useMutation(
    apiImageUploadPostSegments,
    {
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

  // COMMENT
  const createPostCommentMutation = useMutation(apiCreatePostComment, {
    onSuccess: (data) => {
      if (data.result) {
        const commentNew = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                comments: [...prevData.comments, commentNew],
              }
        )
      }
    },
  })

  // nearly identical to downvote
  const upvotePostCommentMutation = useMutation(apiUpvotePostComment, {
    onSuccess: (data) => {
      if (data.result) {
        const commentUpdated = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                comments: prevData.comments.map((comment) =>
                  comment.commentId === commentUpdated.commentId
                    ? commentUpdated
                    : comment
                ),
              }
        )
      }
    },
    onMutate: async (postCommentId: string) => {
      // cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKey)

      // snapshot the previous value
      const postBeforeMutation = queryClient.getQueryData<QueryData>(queryKey)

      if (userId) {
        // optimistically update to the new value
        if (postBeforeMutation) {
          const postForOptimisticUpdate: QueryData = {
            ...postBeforeMutation,
          }
          let commentsNew = postForOptimisticUpdate.comments
          const commentToUpdate = postForOptimisticUpdate.comments.find(
            (comment) => comment.commentId === postCommentId
          )
          if (commentToUpdate) {
            commentsNew = commentsNew.map((comment) => {
              if (comment.commentId !== postCommentId) {
                return comment
              } else {
                const isUpvoted = commentToUpdate.upvotedBy.some(
                  (vote) => vote.userId === userId
                )
                if (isUpvoted) {
                  return {
                    ...comment,
                    upvotedBy: comment.upvotedBy.filter(
                      (vote) => vote.userId !== userId
                    ),
                  }
                } else {
                  return {
                    ...comment,
                    upvotedBy: [...comment.upvotedBy, { userId }],
                    downvotedBy: comment.downvotedBy.filter(
                      (vote) => vote.userId !== userId
                    ),
                  }
                }
              }
            })

            postForOptimisticUpdate.comments = commentsNew

            queryClient.setQueryData<QueryData>(
              queryKey,
              postForOptimisticUpdate
            )
          }
        }
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
      console.error('Error while upvoting post comment:', err)
    },
  })

  // nearly identical to upvote
  const downvotePostCommentMutation = useMutation(apiDownvotePostComment, {
    onSuccess: (data) => {
      if (data.result) {
        const commentUpdated = data.result
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                comments: prevData.comments.map((comment) =>
                  comment.commentId === commentUpdated.commentId
                    ? commentUpdated
                    : comment
                ),
              }
        )
      }
    },
    onMutate: async (postCommentId: string) => {
      // cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKey)

      // snapshot the previous value
      const postBeforeMutation = queryClient.getQueryData<QueryData>(queryKey)

      if (userId) {
        // optimistically update to the new value
        if (postBeforeMutation) {
          const postForOptimisticUpdate: QueryData = {
            ...postBeforeMutation,
          }
          let commentsNew = postForOptimisticUpdate.comments
          const commentToUpdate = postForOptimisticUpdate.comments.find(
            (comment) => comment.commentId === postCommentId
          )
          if (commentToUpdate) {
            commentsNew = commentsNew.map((comment) => {
              if (comment.commentId !== postCommentId) {
                return comment
              } else {
                const isDownvoted = commentToUpdate.downvotedBy.some(
                  (vote) => vote.userId === userId
                )
                if (isDownvoted) {
                  return {
                    ...comment,
                    downvotedBy: comment.downvotedBy.filter(
                      (vote) => vote.userId !== userId
                    ),
                  }
                } else {
                  return {
                    ...comment,
                    downvotedBy: [...comment.downvotedBy, { userId }],
                    upvotedBy: comment.upvotedBy.filter(
                      (vote) => vote.userId !== userId
                    ),
                  }
                }
              }
            })

            postForOptimisticUpdate.comments = commentsNew

            queryClient.setQueryData<QueryData>(
              queryKey,
              postForOptimisticUpdate
            )
          }
        }
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
      console.error('Error while downvoting post comment:', err)
    },
  })

  const deletePostCommentMutation = useMutation(apiDeletePostComment, {
    onSuccess: (data, deletedCommentCommendId) => {
      // true = comment was deleted
      if (data.result === true) {
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData
            ? null
            : {
                ...prevData,
                comments: prevData.comments.filter(
                  (comment) => comment.commentId !== deletedCommentCommendId
                ),
              }
        )
      }
    },
  })

  // LIKE / UNLIKE
  const likeUnlikePostMutation = useMutation(apiLikeUnlikePost, {
    onMutate: async () => {
      // cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKey)

      // snapshot the previous value
      const postBeforeMutation = queryClient.getQueryData<QueryData>(queryKey)

      if (userId) {
        // optimistically update to the new value
        if (postBeforeMutation) {
          const postForOptimisticUpdate: QueryData = {
            ...postBeforeMutation,
          }
          const isLiked = postForOptimisticUpdate.likedBy.some(
            (like) => like.userId === userId
          )
          if (isLiked) {
            postForOptimisticUpdate.likedBy =
              postForOptimisticUpdate.likedBy.filter(
                (like) => like.userId !== userId
              )
          } else {
            postForOptimisticUpdate.likedBy = [
              ...postForOptimisticUpdate.likedBy,
              { userId },
            ]
          }

          queryClient.setQueryData<QueryData>(queryKey, postForOptimisticUpdate)
        }
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
      console.error('Error while liking/unliking post:', err)
    },
    // `postId` coming from apiLikeUnlikePost
    onSuccess: (data, postId) => {
      if (data.result) {
        const likedByUpdated = data.result.likedBy
        queryClient.setQueryData<QueryData>(queryKey, (prevData) =>
          !prevData ? null : { ...prevData, likedBy: likedByUpdated }
        )
        syncPostsLikedData(queryClient, postId, likedByUpdated)
      }
    },
  })

  return {
    updatePostMutation,
    createPostSegmentItemMutation,
    updatePostSegmentItemMutation,
    updatePostSegmentImageIdMutation,
    createPostSegmentMutation,
    updatePostSegmentMutation,
    createPostCommentMutation,
    deletePostCommentMutation,
    likeUnlikePostMutation,
    upvotePostCommentMutation,
    downvotePostCommentMutation,
  }
}
