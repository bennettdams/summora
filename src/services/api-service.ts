import type { Prisma } from '@prisma/client'
import { ApiAvatarsUpload } from '../pages/api/avatars/upload'
import { ApiPostSegmentItemUpdate } from '../pages/api/post-segment-items/[postSegmentItemId]'
import { ApiPostSegmentCreate } from '../pages/api/post-segments'
import { ApiPostSegmentUpdate } from '../pages/api/post-segments/[postSegmentId]'
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
  POST_SEGMENT: (postSegmentId: string) => `post-segments/${postSegmentId}`,
  POST_SEGMENT_ITEMS: 'post-segment-items',
  POST_SEGMENT_ITEM: (postSegmentItemId: string) =>
    `post-segment-items/${postSegmentItemId}`,
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

export type ApiPostUpdateRequestBody = Prisma.PostUpdateInput & {
  categoryId?: string
  tagIds?: string[]
}

export async function apiUpdatePost({
  postId,
  postToUpdate,
}: {
  postId: string
  postToUpdate: ApiPostUpdateRequestBody
}): Promise<HttpResponse<ApiPostUpdate>> {
  const response = await put<ApiPostUpdate>(
    ROUTES_API.POST(postId),
    postToUpdate
  )
  if (response.result) response.result = transformApiPost(response.result)
  return response
}

// #########################################

export type ApiPostSegmentUpdateRequestBody = Prisma.PostSegmentUpdateInput

export async function apiUpdatePostSegment({
  postSegmentId,
  postSegmentToUpdate,
}: {
  postSegmentId: string
  postSegmentToUpdate: ApiPostSegmentUpdateRequestBody
}): Promise<HttpResponse<ApiPostSegmentUpdate>> {
  const response = await put<ApiPostSegmentUpdate>(
    ROUTES_API.POST_SEGMENT(postSegmentId),
    postSegmentToUpdate
  )
  if (response.result)
    response.result = transformApiPostSegment(response.result)
  return response
}

function transformApiPostSegment(
  postSegment: NonNullable<ApiPostSegmentUpdate>
): NonNullable<ApiPostSegmentUpdate> {
  return {
    ...postSegment,
    createdAt: new Date(postSegment.createdAt),
    updatedAt: new Date(postSegment.updatedAt),
    items: postSegment.items.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
  }
}

// #########################################

export type ApiPostSegmentItemUpdateRequestBody =
  Prisma.PostSegmentItemUpdateInput

export async function apiUpdatePostSegmentItem({
  postSegmentItemId,
  postSegmentItemToUpdate,
}: {
  postSegmentItemId: string
  postSegmentItemToUpdate: ApiPostSegmentItemUpdateRequestBody
}): Promise<HttpResponse<ApiPostSegmentItemUpdate>> {
  const response = await put<ApiPostSegmentItemUpdate>(
    ROUTES_API.POST_SEGMENT_ITEM(postSegmentItemId),
    postSegmentItemToUpdate
  )
  if (response.result)
    response.result = transformApiPostSegmentItem(response.result)
  return response
}

function transformApiPostSegmentItem(
  postSegmentItem: NonNullable<ApiPostSegmentItemUpdate>
): NonNullable<ApiPostSegmentItemUpdate> {
  return {
    ...postSegmentItem,
    createdAt: new Date(postSegmentItem.createdAt),
    updatedAt: new Date(postSegmentItem.updatedAt),
  }
}

// #########################################

export type ApiPostSegmentCreateRequestBody = {
  postId: string
  postSegmentToCreate: Prisma.PostSegmentCreateWithoutPostInput
}

export async function apiCreatePostSegment(
  input: ApiPostSegmentCreateRequestBody
): Promise<HttpResponse<ApiPostSegmentCreate>> {
  const response = await post<ApiPostSegmentCreate>(
    ROUTES_API.POST_SEGMENTS,
    input
  )
  if (response.result)
    response.result = transformApiPostSegment(response.result)
  return response
}

// #########################################
