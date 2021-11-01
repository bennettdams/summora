import type { User } from '@prisma/client'
import {
  PostPostAPI,
  PostSegmentItemPostAPI,
  PostSegmentPostAPI,
} from '../pages/api/posts/[postId]'
import { get, HttpResponse, post, postFile } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  USERS_USER_ID: (userId: string) => `users/${userId}`,
  AVATARS_UPLOAD: 'avatars/upload',
  POSTS: 'posts',
  POSTS_POST_ID: (postId: string) => `posts/${postId}`,
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

export async function apiFetchUser(
  userId: string
): Promise<HttpResponse<User>> {
  return await get<User>(ROUTES_API.USERS_USER_ID(userId))
}

// #########################################

export type ApiPostsPostIdGetRequestBody = null

export async function apiFetchPost(
  postId: string
): Promise<HttpResponse<PostPostAPI>> {
  const post = await get<PostPostAPI>(ROUTES_API.POSTS_POST_ID(postId))
  if (post.result) post.result = transformPostPostAPI(post.result)
  return post
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
