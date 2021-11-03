import type { Prisma } from '@prisma/client'
import { ApiAvatarsUpload } from '../pages/api/avatars/upload'
import { ApiPosts } from '../pages/api/posts/[postId]'
import { ApiUsersSignUp } from '../pages/api/users/signup'
import { ApiUsers } from '../pages/api/users/[userId]'
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
): Promise<HttpResponse<ApiUsers>> {
  return await get<ApiUsers>(ROUTES_API.USERS_USER_ID(userId))
}

// #########################################

export async function apiFetchPost(
  postId: string
): Promise<HttpResponse<ApiPosts>> {
  const post = await get<ApiPosts>(ROUTES_API.POSTS_POST_ID(postId))
  if (post.result) post.result = transformPostPostAPI(post.result)
  return post
}

function transformPostPostAPI(post: NonNullable<ApiPosts>): ApiPosts {
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

  }
}
