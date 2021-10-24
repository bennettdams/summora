import { createClient, User } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { GetServerSidePropsContextRequest } from '../../types/GetServerSidePropsContextRequest = GetServerSidePropsContext'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const STORAGE = {
  AVATARS: {
    bucket: 'avatars',
    folder: 'public',
  },
} as const

const AVATAR_EXTENSION = 'jpg'

if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase keys.')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function setAuthCookie(req: NextApiRequest, res: NextApiResponse): void {
  return supabase.auth.api.setAuthCookie(req, res)
}

export async function getUserByCookieSupabase(
  req: GetServerSidePropsContextRequest
): Promise<{ user: User | null; data: User | null; error: Error | null }> {
  return await supabase.auth.api.getUserByCookie(req)
}

export async function signInSupabase(
  email: string,
  password: string
): Promise<ReturnType<typeof supabase.auth.signIn>> {
  return await supabase.auth.signIn({ email, password })
}

export async function signUpSupabase(
  email: string,
  password: string
): Promise<ReturnType<typeof supabase.auth.signUp>> {
  return await supabase.auth.signUp({ email, password })
}

export async function signOutSupabase(): Promise<
  ReturnType<typeof supabase.auth.signOut>
> {
  return await supabase.auth.signOut()
}

export async function uploadAvatarSupabase(
  /**
   * filename & extension, e.g. "example.png"
   */
  filepath: string,
  picture: File
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE.AVATARS.bucket)
      .upload(`${STORAGE.AVATARS.folder}/${filepath}`, picture, {
        upsert: true,
      })
    if (error) throw error
  } catch (error) {
    throw new Error(
      `Error while uploading avatar file: ${error.message || error}`
    )
  }
}

export async function downloadAvatarSupabase(
  /**
   * filename without extension, e.g. "example" for "example.png"
   */
  filepath: string
): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE.AVATARS.bucket)
    .download(`${STORAGE.AVATARS.folder}/${filepath}.${AVATAR_EXTENSION}`)

  if (error) {
    throw new Error(`Error while downloading avatar: ${error.message}`)
  } else {
    return data
  }
}
