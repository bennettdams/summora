import type { Profile } from '@prisma/client'
import { HttpResponse, post, put } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  AVATARS_UPLOAD: 'avatars/upload',
} as const

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
  return await put<void>(ROUTES_API.AVATARS_UPLOAD, input)
}
