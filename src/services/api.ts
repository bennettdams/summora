import type { Profile } from '@prisma/client'
import { HttpResponse, post } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
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
