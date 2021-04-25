import { Prisma } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { PostPostsAPI } from '../pages/api/posts'
import {
  PostPostAPI,
  PostSegmentItemPostAPI,
  PostSegmentPostAPI,
} from '../pages/api/posts/[postId]'

const urlPost = '/api/posts'
const urlPostSegmentItem = '/api/post-segment-items'
export const queryKeyPosts = 'posts'

function usePostsMutation() {
  const queryClient = useQueryClient()

  const createPostMutation = useMutation(createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeyPosts)
    },
  })

  return { createPostMutation }
}

function usePostMutation(postId: string) {
  const queryClient = useQueryClient()

  const updatePostSegmentItemMutation = useMutation(updatePostSegmentItem, {
    onSuccess: (data: PostPostAPI) => {
      queryClient.setQueryData([queryKeyPosts, postId], data)
    },
  })
  // const updatePostSegmentItemMutation = useMutation(
  //   async (newSegmentItem: Prisma.PostSegmentItemUpdateInput) =>
  //     await updatePostSegmentItem(postId, 'asd', newSegmentItem),
  //   {
  //     onSuccess: (data: Post) => {
  //       // console.log('item', data.segments[0].items[0])
  //       queryClient.setQueryData([queryKeyPosts, postId], data)
  //     },
  //   }
  // )

  // const mutation = useMutation(updatePostSegmentItem, {
  //   onSuccess: (data) => {
  //     queryClient.setQueryData(['todo', { id: 5 }], data)
  //   },
  // })

  return { updatePostSegmentItemMutation }
}

export function usePosts() {
  const { data, isLoading, isError } = useQuery<PostPostsAPI[]>(
    queryKeyPosts,
    fetchPosts
  )
  const { createPostMutation } = usePostsMutation()

  return {
    posts: data || null,
    isLoading,
    isError,
    createPost: createPostMutation.mutate,
  }
}

export function usePost(postId: string, enabled = true) {
  const { data, isLoading, isError } = useQuery<PostPostAPI>(
    [queryKeyPosts, postId],
    () => fetchPost(postId),
    { enabled }
  )

  const { updatePostSegmentItemMutation } = usePostMutation(postId)

  return {
    post: data || null,
    isLoading,
    isError,
    updatePostSegmentItem: updatePostSegmentItemMutation.mutate,
  }
}

async function fetchPosts(): Promise<PostPostsAPI[]> {
  const response = await fetch(`${urlPost}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postsJSON = await response.json()
  const posts: PostPostsAPI[] = postsJSON.map((postJSON: PostPostsAPI) =>
    transformPostPostsAPI(postJSON)
  )

  return posts
}

async function createPost(post: Prisma.PostCreateInput): Promise<PostPostsAPI> {
  const response = await fetch(urlPost, {
    method: 'POST',
    body: JSON.stringify(post),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postJSON: PostPostsAPI = await response.json()
  const postCreated: PostPostsAPI = transformPostPostsAPI(postJSON)

  return postCreated
}

async function fetchPost(postId: string): Promise<PostPostAPI> {
  const response = await fetch(`${urlPost}/${postId}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postJSON: PostPostAPI = await response.json()
  const post: PostPostAPI = transformPostPostAPI(postJSON)

  return post
}

export interface PostSegmentItemUpdate {
  postId: string
  postSegmentId: string
  postSegmentItemToUpdate: Prisma.PostSegmentItemUpdateWithoutPostSegmentInput
}

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

function transformPostPostAPI(post: PostPostAPI): PostPostAPI {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    segments: post.segments.map((segment) => {
      const segmentTransformed: PostSegmentPostAPI = {
        ...segment,
        createdAt: new Date(segment.createdAt),
        updatedAt: new Date(segment.updatedAt),
        items: segment.items.map((item) => {
          const itemTransformed: PostSegmentItemPostAPI = {
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }
          return itemTransformed
        }),
      }

      return segmentTransformed
    }),
  }
}

function transformPostPostsAPI(post: PostPostsAPI): PostPostsAPI {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  }
}
