import { NextApiRequest, NextApiResponse } from 'next'
import { signOut as signOutNextAuth, useSession } from 'next-auth/react'
import {
  createSupabaseClientFromRequest,
  signUpSupabase,
} from './supabase/supabase-service'

export function useAuth() {
  const { data: sessionData, status } = useSession()

  async function signOut() {
    return await signOutNextAuth()
  }

  return {
    isLoadingAuth: status === 'loading',
    userIdAuth: sessionData?.user?.id ?? null,
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
