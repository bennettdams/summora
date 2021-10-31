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

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey)
    throw new Error('Missing Supabase keys.')
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

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
      const { error } = await supabaseServer.auth.api.deleteUser(
        userId,
        supabaseServiceKey
      )
      if (error) {
        throw new Error(`Error while deleting user: ${error.message}`)
      }
    }
  }
}

function extractJWTFromNextRequestCookies(req: NextApiRequest): string {
  const jwt = req.cookies['sb:token']
  if (!jwt) throw new Error('No Supabase JWT found in Next.js request')
  return jwt
}

export async function uploadAvatarSupabase(
  /**
   * filename & extension, e.g. "example.png"
   */
  filepath: string,
  avatarFileParsed: Buffer,
  req: NextApiRequest
): Promise<void> {
  const supabaseServer = createSupabaseClient()
  supabaseServer.auth.setAuth(extractJWTFromNextRequestCookies(req))

  const { error } = await supabaseServer.storage
    .from(STORAGE.AVATARS.bucket)
    .upload(`${STORAGE.AVATARS.folder}/${filepath}`, avatarFileParsed, {
      upsert: true,
      contentType: 'image/jpg',
    })

  if (error) {
    throw new Error(
      `Error while uploading avatar file (Supabase: ${error.message}`
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
