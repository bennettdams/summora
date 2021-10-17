import type { Profile } from '@prisma/client'
import { HttpResponse, post } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  AVATARS_UPLOAD: 'avatars/upload',
  POSTS: 'posts',
  POSTS_POST_ID: 'posts/:postId',
  PROFILES_PROFILE_ID: 'profiles/:profileId',
  SEARCH_TAGS: 'search-tags',
  POST_SEGMENTS: 'post-segments',
  POST_SEGMENTS_POST_SEGMENT_ID: 'post-segments/:postSegmentId',
  POST_SEGMENT_ITEMS: 'post-segment-items',
  POST_SEGMENT_ITEMS_POST_SEGMENT_ITEM_ID:
    'post-segment-items/:postSegmentItemId',
} as const

export function logAPI(
  route: keyof typeof ROUTES_API,
  method: string | undefined,
  additionalText?: string
): void {
  let log = `[API] ${ROUTES_API[route]} | method: ${method}`
  if (additionalText) {
    log += ` | ${additionalText}`
  }
  console.log(log)
}

export type ApiUsersSignUpRequestBody = {
  username: string
  email: string
  password: string
}

export type ApiUsersSignUpReturn = Profile

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

export type ApiAvatarsUploadRequestBody = {
  filepath: string
  avatarBlob: Blob
}

export async function apiAvatarsUpload(
  filepath: string,
  avatarBlob: Blob
): Promise<HttpResponse<void>> {
  const input: ApiAvatarsUploadRequestBody = {
    filepath,
    avatarBlob,
  }
  return await post<void>(ROUTES_API.AVATARS_UPLOAD, input)
}
