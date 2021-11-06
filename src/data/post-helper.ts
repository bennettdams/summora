import { useMutation, useQuery, useQueryClient } from 'react-query'
import { PostSegmentCreate } from '../pages/api/post-segments'
import { PostSegmentItemCreate } from '../pages/api/post-segment-items'
import { PostSegmentItemUpdate } from '../pages/api/post-segment-items/[postSegmentItemId]'
import { PostSegmentUpdate } from '../pages/api/post-segments/[postSegmentId]'
import { apiFetchPost, apiUpdatePost } from '../services/api-service'
import { ApiPost } from '../pages/api/posts/[postId]'

// const urlPost = '/api/posts'
const urlPostSegmentItem = '/api/post-segment-items'
const urlPostSegment = '/api/post-segments'
const queryKeyPostBase = 'post'

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

  const createPostSegmentItemMutation = useMutation(createPostSegmentItem, {
    onSuccess: (data: ApiPost) => {
      queryClient.setQueryData(createQueryKey(postId), data)
    },
  })

  const createPostSegmentMutation = useMutation(createPostSegment, {
    onSuccess: (data: ApiPost) => {
      queryClient.setQueryData(createQueryKey(postId), data)
    },
  })

  const updatePostMutation = useMutation(apiUpdatePost, {
    onSuccess: (data) => {
      queryClient.setQueryData(createQueryKey(postId), data)
    },
  })

  const updatePostSegmentMutation = useMutation(updatePostSegment, {
    onSuccess: (data: ApiPost) => {
      queryClient.setQueryData(createQueryKey(postId), data)
    },
  })

  const updatePostSegmentItemMutation = useMutation(updatePostSegmentItem, {
    onSuccess: (data: ApiPost) => {
      queryClient.setQueryData(createQueryKey(postId), data)
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
  const { data, isLoading, isError } = useQuery<ApiPost | null>(
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

// async function createPost(post: Prisma.PostCreateInput): Promise<PostPostsAPI> {
//   const response = await fetch(urlPost, {
//     method: 'POST',
//     body: JSON.stringify(post),
//   })

//   if (!response.ok) {
//     throw new Error(response.statusText)
//   }

//   const postJSON: PostPostsAPI = await response.json()
//   const postCreated: PostPostsAPI = transformPostPostsAPI(postJSON)

//   return postCreated
// }

async function updatePostSegmentItem({
  postId,
  postSegmentId,
  postSegmentItemToUpdate,
}: PostSegmentItemUpdate): Promise<PostPostAPI> {
  if (!postId || !postSegmentId || !postSegmentItemToUpdate.id)
    throw new Error(
      'Cannot update post segment item, no post ID / post segment ID / post segment item ID!'
    )

  const body: PostSegmentItemUpdate = {
    postId,
    postSegmentId,
    postSegmentItemToUpdate: {
      id: postSegmentItemToUpdate.id,
      content: postSegmentItemToUpdate.content,
    },
  }

  const response = await fetch(
    `${urlPostSegmentItem}/${postSegmentItemToUpdate.id}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postJSON: PostPostAPI = await response.json()
  const postUpdated: PostPostAPI = transformPostPostAPI(postJSON)

  return postUpdated
}

async function updatePostSegment({
  postId,
  postSegmentToUpdate,
}: PostSegmentUpdate): Promise<PostPostAPI> {
  if (!postId || !postSegmentToUpdate.id)
    throw new Error('Cannot update post segment, no post ID / post segment ID!')

  const body: PostSegmentUpdate = {
    postId,
    postSegmentToUpdate: {
      id: postSegmentToUpdate.id,
      title: postSegmentToUpdate.title,
      subtitle: postSegmentToUpdate.subtitle,
    },
  }

  const response = await fetch(`${urlPostSegment}/${postSegmentToUpdate.id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postJSON: PostPostAPI = await response.json()
  const postUpdated: PostPostAPI = transformPostPostAPI(postJSON)

  return postUpdated
}

async function createPostSegmentItem({
  postId,
  postSegmentId,
  postSegmentItemToCreate,
}: PostSegmentItemCreate): Promise<PostPostAPI> {
  if (!postId || !postSegmentId)
    throw new Error(
      'Cannot create post segment item, no post ID / post segment ID!'
    )

  const body: PostSegmentItemCreate = {
    postId,
    postSegmentId,
    postSegmentItemToCreate,
  }

  const response = await fetch(`${urlPostSegmentItem}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postJSON: PostPostAPI = await response.json()
  const postUpdated: PostPostAPI = transformPostPostAPI(postJSON)

  return postUpdated
}

async function createPostSegment({
  postId,
  postSegmentToCreate,
}: PostSegmentCreate): Promise<PostPostAPI> {
  if (!postId) throw new Error('Cannot create post segment, no post ID!')

  const body: PostSegmentCreate = {
    postId,
    postSegmentToCreate,
  }

  const response = await fetch(`${urlPostSegment}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postJSON: PostPostAPI = await response.json()
  const postUpdated: PostPostAPI = transformPostPostAPI(postJSON)

  return postUpdated
}
