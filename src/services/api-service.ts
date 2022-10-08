import type { Prisma } from '@prisma/client'
import { ApiAvatarsUpload } from '../pages/api/image-upload/avatars'
import { ApiImageUploadPostSegment } from '../pages/api/image-upload/[postId]/[postSegmentId]'
import { ApiPostCategories } from '../pages/api/post-categories'
import { ApiPostSegmentItemCreate } from '../pages/api/post-segment-items'
import {
  ApiPostSegmentItemDelete,
  ApiPostSegmentItemUpdate,
} from '../pages/api/post-segment-items/[postSegmentItemId]'
import { ApiPostSegmentCreate } from '../pages/api/post-segments'
import {
  ApiPostSegmentDelete,
  ApiPostSegmentUpdate,
} from '../pages/api/post-segments/[postSegmentId]'
import { ApiPosts, ApiPostsCreate } from '../pages/api/posts'
import { ApiPost, ApiPostUpdate } from '../pages/api/posts/[postId]'
import { ApiPostIncrementViews } from '../pages/api/posts/[postId]/increment-views'
import { ApiPostLikeUnlikePost } from '../pages/api/posts/[postId]/like-unlike'
import { ApiTagsSearch } from '../pages/api/tags/search'
import { ApiUsersSignUp } from '../pages/api/users/signup'
import {
  deleteHTTP,
  get,
  HttpResponse,
  post,
  postFile,
  put,
} from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  POST_CATEGORIES: 'post-categories',
  POSTS: 'posts',
  POST: (postId: string) => `posts/${postId}`,
  POST_INCREMENT_VIEWS: (postId: string) => `posts/${postId}/increment-views`,
  POST_LIKE_UNLIKE: (postId: string) => `posts/${postId}/like-unlike`,
  TAGS_SEARCH: 'tags/search',
  POST_SEGMENTS: 'post-segments',
  POST_SEGMENT: (postSegmentId: string) => `post-segments/${postSegmentId}`,
  POST_SEGMENT_ITEMS: 'post-segment-items',
  POST_SEGMENT_ITEM: (postSegmentItemId: string) =>
    `post-segment-items/${postSegmentItemId}`,
  IMAGE_UPLOAD_AVATARS: 'image-upload/avatars',
  IMAGE_UPLOAD_POST_SEGMENTS: ({
    postId,
    postSegmentId,
  }: {
    postId: string
    postSegmentId: string
  }) => `image-upload/${postId}/${postSegmentId}`,
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

export type ApiImageUploadAvatarsRequestBody = FormData

export async function apiImageUploadAvatars(
  avatarFile: File
): Promise<HttpResponse<ApiAvatarsUpload>> {
  return await postFile<ApiAvatarsUpload>(
    ROUTES_API.IMAGE_UPLOAD_AVATARS,
    avatarFile
  )
}

// #########################################

export type ApiImageUploadPostSegmentsRequestBody = FormData

export async function apiImageUploadPostSegments({
  postId,
  postSegmentId,
  postSegmentImageFile,
}: {
  postId: string
  postSegmentId: string
  postSegmentImageFile: File
}): Promise<HttpResponse<ApiImageUploadPostSegment>> {
  return await postFile<ApiImageUploadPostSegment>(
    ROUTES_API.IMAGE_UPLOAD_POST_SEGMENTS({ postId, postSegmentId }),
    postSegmentImageFile
  )
}

// #########################################

export async function apiFetchPostCategories(): Promise<
  HttpResponse<ApiPostCategories>
> {
  return await get<ApiPostCategories>(ROUTES_API.POST_CATEGORIES)
}

// #########################################

export async function apiFetchPost(
  postId: string
): Promise<HttpResponse<ApiPost>> {
  const response = await get<ApiPost>(ROUTES_API.POST(postId))
  if (response.result) response.result = transformApiPost(response.result)
  return response
}

export function transformApiPost(
  post: NonNullable<ApiPost>
): NonNullable<ApiPost> {
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

export function transformApiPosts(posts: ApiPosts): ApiPosts {
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

export type ApiPostsCreateRequestBody = {
  postToCreate: {
    title: string
    subtitle: string
    categoryId: string
  }
}

export async function apiCreatePost(
  input: ApiPostsCreateRequestBody
): Promise<HttpResponse<ApiPostsCreate>> {
  const response = await post<ApiPostsCreate>(ROUTES_API.POSTS, input)
  if (response.result) response.result = transformApiPost(response.result)
  return response
}

// #########################################

export type ApiPostIncrementViewsRequestBody = null

export async function apiIncrementPostViews(
  postId: string
): Promise<HttpResponse<ApiPostIncrementViews>> {
  const response = await put<ApiPostIncrementViews>(
    ROUTES_API.POST_INCREMENT_VIEWS(postId),
    null
  )
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

export async function apiDeletePostSegment(
  postSegmentId: string
): Promise<HttpResponse<ApiPostSegmentDelete>> {
  const response = await deleteHTTP<ApiPostSegmentDelete>(
    ROUTES_API.POST_SEGMENT(postSegmentId)
  )
  return response
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

export async function apiDeletePostSegmentItem(
  postSegmentItemId: string
): Promise<HttpResponse<ApiPostSegmentItemDelete>> {
  const response = await deleteHTTP<ApiPostSegmentItemDelete>(
    ROUTES_API.POST_SEGMENT_ITEM(postSegmentItemId)
  )
  return response
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

export type ApiPostSegmentItemCreateRequestBody = {
  postSegmentId: string
  postSegmentItemToCreate: Prisma.PostSegmentItemCreateWithoutPostSegmentInput
}

export async function apiCreatePostSegmentItem(
  input: ApiPostSegmentItemCreateRequestBody
): Promise<HttpResponse<ApiPostSegmentItemCreate>> {
  const response = await post<ApiPostSegmentItemCreate>(
    ROUTES_API.POST_SEGMENT_ITEMS,
    input
  )
  if (response.result)
    response.result = transformApiPostSegmentItem(response.result)
  return response
}

// #########################################
// TAGS SEARCH

export type ApiTagsSearchCreateRequestBody = {
  searchInput: string
}

export async function apiCreateTagsSearch(
  input: ApiTagsSearchCreateRequestBody
): Promise<HttpResponse<ApiTagsSearch>> {
  const response = await post<ApiTagsSearch>(ROUTES_API.TAGS_SEARCH, input)
  if (response.result) response.result = transformApiTagsSearch(response.result)
  return response
}

function transformApiTagsSearch(
  tags: NonNullable<ApiTagsSearch>
): NonNullable<ApiTagsSearch> {
  return tags.map((tag) => ({
    ...tag,
    createdAt: new Date(tag.createdAt),
    updatedAt: new Date(tag.updatedAt),
  }))
}

// #########################################
// POST LIKE UNLIKE

export async function apiLikeUnlikePost(
  postId: string
): Promise<HttpResponse<ApiPostLikeUnlikePost>> {
  const response = await put<ApiPostLikeUnlikePost>(
    ROUTES_API.POST_LIKE_UNLIKE(postId),
    null
  )
  return response
}

// #########################################
