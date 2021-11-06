import type { Prisma } from '@prisma/client'
import { ApiAvatarsUpload } from '../pages/api/avatars/upload'
import { ApiPosts } from '../pages/api/posts'
import { ApiPost, ApiPostUpdate } from '../pages/api/posts/[postId]'
import { ApiUsersSignUp } from '../pages/api/users/signup'
import { ApiUser } from '../pages/api/users/[userId]'
import { get, HttpResponse, post, postFile, put } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  USER: (userId: string) => `users/${userId}`,
  AVATARS_UPLOAD: 'avatars/upload',
  POSTS: 'posts',
  POST: (postId: string) => `posts/${postId}`,
  SEARCH_TAGS: 'search-tags',
  POST_SEGMENTS: 'post-segments',
  POST_SEGMENTS_POST_SEGMENT_ID: 'post-segments/:postSegmentId',
  POST_SEGMENT_ITEMS: 'post-segment-items',
  POST_SEGMENT_ITEMS_POST_SEGMENT_ITEM_ID:
    'post-segment-items/:postSegmentItemId',
} as const

// #########################################

export type ApiUsersSignUpRequestBody = {
  username: string
  email: string
  password: string
}

export async function apiUsersSignUp(
  username: string,
  email: string,
  password: string
): Promise<HttpResponse<ApiUsersSignUp>> {
  const input: ApiUsersSignUpRequestBody = {
    username,
    email,
    password,
  }
  return await post<ApiUsersSignUp>(ROUTES_API.USERS_SIGN_UP, input)
}

// #########################################

export type ApiAvatarsUploadRequestBody = FormData

export async function apiAvatarsUpload(
  avatarFile: File
): Promise<HttpResponse<ApiAvatarsUpload>> {
  return await postFile<ApiAvatarsUpload>(ROUTES_API.AVATARS_UPLOAD, avatarFile)
}

// #########################################

export async function apiFetchUser(
  userId: string
): Promise<HttpResponse<ApiUser>> {
  return await get<ApiUser>(ROUTES_API.USER(userId))
}

// #########################################

export async function apiFetchPost(
  postId: string
): Promise<HttpResponse<ApiPost>> {
  const response = await get<ApiPost>(ROUTES_API.POST(postId))
  if (response.result) response.result = transformApiPost(response.result)
  return response
}

function transformApiPost(post: NonNullable<ApiPost>): NonNullable<ApiPost> {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
    segments: post.segments.map((segment) => ({
      ...segment,
      createdAt: new Date(segment.createdAt),
      updatedAt: new Date(segment.updatedAt),
      items: segment.items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })),
    })),
  }
}

// #########################################

export async function apiFetchPosts(): Promise<HttpResponse<ApiPosts>> {
  const response = await get<ApiPosts>(ROUTES_API.POSTS)
  if (response.result) response.result = transformApiPosts(response.result)
  return response
}

function transformApiPosts(posts: ApiPosts): ApiPosts {
  return posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  }))
}

// #########################################

export type ApiPostUpdateRequestBody = {
  postId: string
  postToUpdate: Prisma.PostUpdateInput & {
    categoryId?: string
    tagIds?: string[]
  }
}

export async function apiUpdatePost({
  postId,
  postToUpdate,
}: ApiPostUpdateRequestBody): Promise<HttpResponse<ApiPostUpdate>> {
  const response = await put<ApiPostUpdate>(ROUTES_API.POST(postId), {
    postId,
    postToUpdate,
  })
  if (response.result) response.result = transformApiPost(response.result)
  return response
}
