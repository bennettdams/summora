import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { GetServerSidePropsContextRequest } from '../../types/GetServerSidePropsContextRequest = GetServerSidePropsContext'
import { isServer } from '../../util/server/server-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const STORAGE = {
  AVATARS: {
    bucket: 'avatars',
    rootFolder: 'public',
    extension: 'jpg',
    /**
     * `userId` is used in Supabase for the policy attached to that post
     */
    filePath: ({ userId, imageId }: { userId: string; imageId: string }) =>
      `${STORAGE.AVATARS.rootFolder}/${userId}/${imageId}.${STORAGE.AVATARS.extension}`,
  },
  POST_IMAGES: {
    bucket: 'post-images',
    rootFolder: 'public',
    extension: 'jpg',
    /**
     * `authorId` is used in Supabase for the policy attached to that post
     */
    filePath: ({
      postId,
      authorId,
      imageId,
    }: {
      postId: string
      authorId: string
      imageId: string
    }) =>
      `${STORAGE.POST_IMAGES.rootFolder}/${postId}/${authorId}/${imageId}.${STORAGE.POST_IMAGES.extension}`,
  },
} as const

function createSupabaseClient(supabaseKey = supabaseAnonKey) {
  if (!supabaseUrl || !supabaseKey)
    throw new Error('Missing Supabase URL or key.')
  return createClient(supabaseUrl, supabaseKey)
}

export const supabase = createSupabaseClient()

export function setAuthCookie(req: NextApiRequest, res: NextApiResponse): void {
  return supabase.auth.api.setAuthCookie(req, res)
}

/**
 * Send session to /api/auth route to set the auth cookie.
 * NOTE: this is only needed if you're doing SSR (getServerSideProps).
 */
export async function setUpSSRAuthSupabase(
  session: Session | null,
  event: AuthChangeEvent | null
) {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ event, session }),
  })

  if (!response.ok) {
    throw new Error('Cannot setup auth for SSR.')
  }
}

// TODO use local supabase const here instead?
export function getSessionSupabase(supabaseClient: SupabaseClient) {
  return supabaseClient.auth.session()
}

export async function getUserByCookieSupabase(
  req: GetServerSidePropsContextRequest
) {
  return await supabase.auth.api.getUserByCookie(req)
}

export async function signInSupabase(
  email: string,
  password: string
): Promise<ReturnType<typeof supabase.auth.signIn>> {
  return await supabase.auth.signIn({ email, password })
}

export async function signUpSupabase(email: string, password: string) {
  return await supabase.auth.signUp({ email, password })
}

export async function signOutSupabase(): Promise<
  ReturnType<typeof supabase.auth.signOut>
> {
  return await supabase.auth.signOut()
}

export async function deleteUserSupabase(userId: string): Promise<void> {
  if (!isServer()) {
    throw new Error(
      `${deleteUserSupabase.name} can only be used on the server.`
    )
  } else {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
    if (!supabaseServiceKey) {
      throw new Error('No Supabase service key.')
    } else {
      const supabaseServer = createSupabaseClient(supabaseServiceKey)
      const { error } = await supabaseServer.auth.api.deleteUser(userId)
      if (error) {
        throw new Error(`Error while deleting user: ${error.message}`)
      }
    }
  }
}

async function extractAccessTokenFromNextRequestCookies(
  req: NextApiRequest
): Promise<string> {
  const { token } = await supabase.auth.api.getUserByCookie(req)
  if (!token)
    throw new Error('No Supabase Access Token found in Next.js request')
  return token
}

// AVATAR #########
export async function uploadAvatarSupabase({
  userId,
  imageId,
  avatarFileParsed,
  req,
}: {
  userId: string
  imageId: string
  avatarFileParsed: Buffer
  req: NextApiRequest
}): Promise<void> {
  const supabaseServer = createSupabaseClient()
  supabaseServer.auth.setAuth(
    await extractAccessTokenFromNextRequestCookies(req)
  )

  const { error } = await supabaseServer.storage
    .from(STORAGE.AVATARS.bucket)
    .upload(STORAGE.AVATARS.filePath({ userId, imageId }), avatarFileParsed, {
      upsert: true,
      contentType: 'image/jpg',
    })

  if (error) {
    throw new Error(
      `Error while uploading avatar file (Supabase: ${error.message}`
    )
  }
}

export async function deleteAvatarSupabase({
  userId,
  imageId,
  req,
}: {
  userId: string
  imageId: string
  req: NextApiRequest
}): Promise<void> {
  const supabaseServer = createSupabaseClient()
  supabaseServer.auth.setAuth(
    await extractAccessTokenFromNextRequestCookies(req)
  )

  const { error } = await supabaseServer.storage
    .from(STORAGE.AVATARS.bucket)
    .remove([STORAGE.AVATARS.filePath({ userId, imageId })])

  if (error) {
    throw new Error(
      `Error while deleting avatar image file (Supabase: ${error.message}`
    )
  }
}

export async function downloadAvatarSupabase({
  userId,
  imageId,
}: {
  userId: string
  imageId: string
}): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE.AVATARS.bucket)
    .download(STORAGE.AVATARS.filePath({ userId, imageId }))

  if (error) {
    throw new Error(`Error while downloading avatar: ${error.message}`)
  } else {
    return data
  }
}

export function getPublicURLAvatarSupabase({
  userId,
  imageId,
}: {
  userId: string
  imageId: string
}): string | null {
  const { publicURL, error } = supabase.storage
    .from(STORAGE.AVATARS.bucket)
    .getPublicUrl(STORAGE.AVATARS.filePath({ userId, imageId }))

  if (error) {
    throw new Error(
      `Error while getting public URL for avatar: ${error.message}`
    )
  } else {
    return publicURL
  }
}

// POST SEGMENT IMAGE #########
export async function uploadPostSegmentImageSupabase({
  postId,
  authorId,
  imageId,
  postSegmentImageFileParsed,
  req,
}: {
  postId: string
  authorId: string
  imageId: string
  postSegmentImageFileParsed: Buffer
  req: NextApiRequest
}): Promise<void> {
  const supabaseServer = createSupabaseClient()
  supabaseServer.auth.setAuth(
    await extractAccessTokenFromNextRequestCookies(req)
  )

  const { error } = await supabaseServer.storage
    .from(STORAGE.POST_IMAGES.bucket)
    .upload(
      STORAGE.POST_IMAGES.filePath({ postId, authorId, imageId }),
      postSegmentImageFileParsed,
      {
        upsert: true,
        contentType: 'image/jpg',
      }
    )

  if (error) {
    throw new Error(
      `Error while uploading post segment image file (Supabase: ${error.message}`
    )
  }
}

export async function deletePostSegmentImageSupabase({
  postId,
  authorId,
  imageId,
  req,
}: {
  postId: string
  authorId: string
  imageId: string
  req: NextApiRequest
}): Promise<void> {
  const supabaseServer = createSupabaseClient()
  supabaseServer.auth.setAuth(
    await extractAccessTokenFromNextRequestCookies(req)
  )

  const { error } = await supabaseServer.storage
    .from(STORAGE.POST_IMAGES.bucket)
    .remove([STORAGE.POST_IMAGES.filePath({ postId, authorId, imageId })])

  if (error) {
    throw new Error(
      `Error while deleting post segment image file (Supabase: ${error.message}`
    )
  }
}

export async function downloadPostSegmentImageSupabase({
  postId,
  authorId,
  imageId,
}: {
  postId: string
  authorId: string
  imageId: string
}): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE.POST_IMAGES.bucket)
    .download(STORAGE.POST_IMAGES.filePath({ postId, authorId, imageId }))

  if (error) {
    throw new Error(
      `Error while downloading post segment image: ${error.message}`
    )
  } else {
    return data
  }
}

export function getPublicURLPostSegmentImageSupabase({
  postId,
  authorId,
  imageId,
}: {
  postId: string
  authorId: string
  imageId: string
}): string | null {
  const { publicURL, error } = supabase.storage
    .from(STORAGE.POST_IMAGES.bucket)
    .getPublicUrl(STORAGE.POST_IMAGES.filePath({ postId, authorId, imageId }))

  if (error) {
    throw new Error(
      `Error while getting public URL for post segment image: ${error.message}`
    )
  } else {
    return publicURL
  }
}
