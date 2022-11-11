import {
  useSupabaseClient,
  useUser as useUserSupabase,
} from '@supabase/auth-helpers-react'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { apiUsersSignUp } from './api-service'
import {
  createSupabaseClientFromRequest,
  signUpSupabase,
} from './supabase/supabase-service'

export const signInSchema = z.object({
  email: z.string().min(2, 'Username must contain at least 2 characters.'),
  password: z.string().min(6, 'Password must contain at least 6 characters.'),
})

export function useAuth() {
  const userAuth = useUserSupabase()
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

  /**
   * @returns true if sign up was sucessful
   */
  async function signUpWithEmailAndPassword(
    username: string,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const response = await apiUsersSignUp(username, email, password)
      if (!response.ok) {
        console.error('Error while sign up')
        return false
      } else {
        console.info('Signed up')
        return true
      }
    } catch (error) {
      console.error('Something went wrong while signing up')
    }
    return false
  }

  async function signOut() {
    return await supabase.auth.signOut()
  }

  return {
    userIdAuth: userAuth?.id ?? null,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
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
