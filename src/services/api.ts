import type { User } from '@prisma/client'
import { get, HttpResponse, post, postFile } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  USERS_USER_ID: (userId: string) => `users/${userId}`,
  AVATARS_UPLOAD: 'avatars/upload',
  POSTS: 'posts',
  POSTS_POST_ID: 'posts/:postId',
  SEARCH_TAGS: 'search-tags',
  POST_SEGMENTS: 'post-segments',
  POST_SEGMENTS_POST_SEGMENT_ID: 'post-segments/:postSegmentId',
  POST_SEGMENT_ITEMS: 'post-segment-items',
  POST_SEGMENT_ITEMS_POST_SEGMENT_ITEM_ID:
    'post-segment-items/:postSegmentItemId',
} as const

export type ApiUsersSignUpRequestBody = {
  username: string
  email: string
  password: string
}

export type ApiUsersSignUpReturn = User

export async function apiUsersSignUp(
  username: string,
  email: string,
  password: string
): Promise<HttpResponse<ApiUsersSignUpReturn>> {
  const input: ApiUsersSignUpRequestBody = {
    username,
    email,
    password,
  }
  return await post<ApiUsersSignUpReturn>(ROUTES_API.USERS_SIGN_UP, input)
}

// #########################################

export type ApiAvatarsUploadRequestBody = FormData

export async function apiAvatarsUpload(
  avatarFile: File
): Promise<HttpResponse<void>> {
  return await postFile<void>(ROUTES_API.AVATARS_UPLOAD, avatarFile)
}

// #########################################

export type ApiUsersUserIdGetRequestBody = null

export async function apiUsersGet(userId: string): Promise<HttpResponse<User>> {
  return await get<User>(ROUTES_API.USERS_USER_ID(userId))
}
