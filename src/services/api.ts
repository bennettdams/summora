import type { Profile } from '@prisma/client'
import { HttpResponse, post } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
} as const

export type ReturnApiUsersSignUp = Profile

export async function apiUsersSignUp(
  email: string,
  password: string
): Promise<HttpResponse<ReturnApiUsersSignUp>> {
  return await post<ReturnApiUsersSignUp>(ROUTES_API.USERS_SIGN_UP, {
    email,
    password,
  })
}
