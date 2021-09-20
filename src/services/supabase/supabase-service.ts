import { createClient, User } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { GetServerSidePropsContextRequest } from '../../types/GetServerSidePropsContextRequest = GetServerSidePropsContext'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase keys.')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function setAuthCookie(req: NextApiRequest, res: NextApiResponse): void {
  return supabase.auth.api.setAuthCookie(req, res)
}

export async function getUserByCookie(
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
