import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
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

const supabase = createSupabaseClient()

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

      const { error } = await supabaseServer.auth.admin.deleteUser(userId)
      if (error) {
        throw new Error(`Error while deleting user: ${error.message}`)
      }
    }
  }
}

export async function signUpSupabase({
  email,
  password,
}: {
  email: string
  password: string
}) {
  return await supabase.auth.signUp({ email, password })
}

export function createSupabaseClientFromRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return createServerSupabaseClient({
    req,
    res,
  })
}

// AVATAR #########
export async function uploadAvatarSupabase({
  userId,
  imageId,
  avatarFileParsed,
  req,
  res,
}: {
  userId: string
  imageId: string
  avatarFileParsed: Buffer
  req: NextApiRequest
  res: NextApiResponse
}): Promise<void> {
  const supabaseServer = createSupabaseClientFromRequest(req, res)

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
  res,
}: {
  userId: string
  imageId: string
  req: NextApiRequest
  res: NextApiResponse
}): Promise<void> {
  const supabaseServer = createSupabaseClientFromRequest(req, res)

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

/*
 * TODO If this produces an error, it will only be logged via Supabase, but there's no error handling involved.
 * See: https://github.com/supabase/supabase/issues/10204
 */
export function getPublicURLAvatarSupabase({
  userId,
  imageId,
}: {
  userId: string
  imageId: string
}): string | null {
  const { data } = supabase.storage
    .from(STORAGE.AVATARS.bucket)
    .getPublicUrl(STORAGE.AVATARS.filePath({ userId, imageId }))

  return data.publicUrl
}

// POST SEGMENT IMAGE #########
export async function uploadPostSegmentImageSupabase({
  postId,
  authorId,
  imageId,
  postSegmentImageFileParsed,
  req,
  res,
}: {
  postId: string
  authorId: string
  imageId: string
  postSegmentImageFileParsed: Buffer
  req: NextApiRequest
  res: NextApiResponse
}): Promise<void> {
  const supabaseServer = createSupabaseClientFromRequest(req, res)

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
  res,
}: {
  postId: string
  authorId: string
  imageId: string
  req: NextApiRequest
  res: NextApiResponse
}): Promise<void> {
  const supabaseServer = createSupabaseClientFromRequest(req, res)

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

/*
 * TODO If this produces an error, it will only be logged via Supabase, but there's no error handling involved.
 * See: https://github.com/supabase/supabase/issues/10204
 */
export function getPublicURLPostSegmentImageSupabase({
  postId,
  authorId,
  imageId,
}: {
  postId: string
  authorId: string
  imageId: string
}): string | null {
  const { data } = supabase.storage
    .from(STORAGE.POST_IMAGES.bucket)
    .getPublicUrl(STORAGE.POST_IMAGES.filePath({ postId, authorId, imageId }))

  return data.publicUrl
}
