import { ApiAvatarsUpload } from '../pages/api/image-upload/avatars'
import { ApiImageUploadPostSegment } from '../pages/api/image-upload/[postId]/[postSegmentId]'
import { ApiUsersSignUp } from '../pages/api/users/signup'
import { HttpResponse, post, postFile } from '../util/http'

export const ROUTES_API = {
  USERS_SIGN_UP: 'users/signup',
  POST_INCREMENT_VIEWS: (postId: string) => `posts/${postId}/increment-views`,
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
