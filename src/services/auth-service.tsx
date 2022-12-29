import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { NextApiRequest, NextApiResponse } from 'next'
import { signOut as signOutNextAuth, useSession } from 'next-auth/react'
import { z } from 'zod'
import {
  createSupabaseClientFromRequest,
  signUpSupabase,
} from './supabase/supabase-service'

export const signInSchema = z.object({
  email: z.string().min(2, 'Username must contain at least 2 characters.'),
  password: z.string().min(6, 'Password must contain at least 6 characters.'),
})

export function useAuth() {
  const { data: sessionData, status } = useSession()
  const supabase = useSupabaseClient()

  async function signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<void> {
    try {
      const parsed = signInSchema.parse({ email, password })
      const { error } = await supabase.auth.signInWithPassword(parsed)
      if (error) {
        console.error(error.message)
      } else {
        console.info('Signed in')
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function signOut() {
    return await signOutNextAuth()
  }

  return {
    isLoadingAuth: status === 'loading',
    userIdAuth: sessionData?.user?.id ?? null,
    signInWithEmailAndPassword,
    signOut,
  }
}

export async function getUserFromRequest(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<
  | {
      userIdAuth: string
      error: null
    }
  | {
      userIdAuth: null
      error: Error
    }
> {
  const supabaseServerClient = createSupabaseClientFromRequest(req, res)

  const userResult = await supabaseServerClient.auth.getUser()

  if (userResult.error || !userResult) {
    const msg = 'Error while getting user.'
    console.error(msg, userResult.error)

    return {
      userIdAuth: null,
      error: new Error(`${msg} ${userResult.error.message}`),
    }
  } else {
    return { userIdAuth: userResult.data.user.id, error: null }
  }
}

export async function signUp({
  email,
  password,
}: {
  email: string
  password: string
}) {
  return await signUpSupabase({ email, password })
}
