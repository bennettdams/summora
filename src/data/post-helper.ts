import { Prisma } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Post } from '../pages/api/posts/[postId]'

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
    onSuccess: (data: Post) => {
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
  const { data, isLoading, isError } = useQuery<Post[]>(
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
  const { data, isLoading, isError } = useQuery<Post>(
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

async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(`${urlPost}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postsJSON = await response.json()
  const posts = postsJSON.map((postJSON: Post) => transformPost(postJSON))

  return posts
}

async function fetchPost(postId: string): Promise<Post> {
  const response = await fetch(`${urlPost}/${postId}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const postJSON = await response.json()
  const post = transformPost(postJSON)

  return post
}

async function createPost(post: Prisma.PostCreateInput): Promise<Post> {
  const response = await fetch(urlPost, {
    method: 'POST',
    body: JSON.stringify(post),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return await response.json()
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
}: PostSegmentItemUpdate): Promise<Post> {
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

  return await response.json()
}

function transformPost(post: Post): Post {
  return { ...post, createdAt: new Date(post.createdAt) }
}
