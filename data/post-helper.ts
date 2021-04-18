import { Post, Prisma } from '@prisma/client'
import { useMutation, useQuery } from 'react-query'
import { queryClient } from '../pages/_app'

const url = '/api/posts'
const queryKey = 'posts'

function usePostsMutation() {
  const createMutation = useMutation(createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey)
    },
  })

  return { create: createMutation }
}

export function usePosts() {
  const { data, isLoading, isError } = useQuery<Post[]>(queryKey, fetchPosts)
  const { create } = usePostsMutation()

  return { posts: data || null, isLoading, isError, createPost: create.mutate }
}

export function usePost(postId: string | null) {
  const { data, isLoading, isError } = useQuery<Post>(
    [queryKey, postId],
    () => fetchPost(postId || ''),
    { enabled: !!postId }
  )
  const { create } = usePostsMutation()

  return { post: data || null, isLoading, isError, create: create.mutate }
}

async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(`${url}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return await response.json()
}

async function createPost(post: Prisma.PostCreateInput): Promise<Post> {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(post),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return await response.json()
}

async function fetchPost(postId: string): Promise<Post> {
  console.log(`${url}/${postId}`)
  const response = await fetch(`${url}/${postId}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return await response.json()
}
