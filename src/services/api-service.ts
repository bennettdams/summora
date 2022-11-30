import type { Prisma } from '@prisma/client'
import { ApiAvatarsUpload } from '../pages/api/image-upload/avatars'
import { ApiImageUploadPostSegment } from '../pages/api/image-upload/[postId]/[postSegmentId]'
import { ApiPostSegmentItemCreate } from '../pages/api/post-segment-items'
import { ApiPostSegmentItemUpdate } from '../pages/api/post-segment-items/[postSegmentItemId]'
import { ApiPostSegmentCreate } from '../pages/api/post-segments'
import {
  ApiPostSegmentDelete,
  ApiPostSegmentUpdate,
} from '../pages/api/post-segments/[postSegmentId]'
import { ApiPostIncrementViews } from '../pages/api/posts/[postId]/increment-views'
import { ApiUsersSignUp } from '../pages/api/users/signup'
import { deleteHTTP, HttpResponse, post, postFile, put } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  POST_INCREMENT_VIEWS: (postId: string) => `posts/${postId}/increment-views`,
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
