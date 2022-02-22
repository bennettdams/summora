import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  getSessionSupabase,
  getUserByCookieSupabase,
  signInSupabase,
  signOutSupabase,
  signUpSupabase,
} from './supabase/supabase-service'
import { UserAuth } from '../types/UserAuth'
import { Session } from '../types/Session'
import { apiFetchUser, apiUsersSignUp } from './api-service'
import { GetServerSidePropsContextRequest } from '../types/GetServerSidePropsContextRequest = GetServerSidePropsContext'
import { User } from '@prisma/client'

export interface AuthState {
  userAuth: UserAuth | null
  session: Session | null
  isLoading: boolean
  user: User | null
  userId: string | null
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthContextProvider({
  supabaseClient,
  children,
}: {
  supabaseClient: SupabaseClient
  children: ReactNode
}): JSX.Element {
  const [authState, setAuthState] = useState<AuthState>(() => {
    /*
     * We could initialize auth state for the initial render here
     * from Supabase, but this will produce hydration/render mismatch for the server.
     */
    // const session = getSessionSupabase(supabaseClient)
    // const userAuth = session?.user ?? null

    return {
      session: null,
      userAuth: null,
      isLoading: true,
      user: null,
      userId: null,
    }
  })

  /**
   * Fill auth state based on session.
   */
  async function fillAuth(session: Session) {
    const userAuth = session.user
    const userId = userAuth?.id ?? null

    if (!userId) {
      throw new Error('Session exists, but user auth/user ID does not.')
    } else {
      // local session, don't have to wait for user from API
      setAuthState({
        session,
        userAuth,
        isLoading: true,
        user: null,
        userId,
      })

      // user profile from API
      const response = await apiFetchUser(userId)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        user: response.result ?? null,
      }))
    }
  }

  useEffect(() => {
    // #########
    // auth state for initial page load
    const session = supabaseClient.auth.session()

    // initially fetch our user if session exists
    if (session) {
      fillAuth(session)
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
    // #########

    // Supabase will not execute this on the initial render when the session already exists
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAuthState({
            isLoading: false,
            session: null,
            user: null,
            userAuth: null,
            userId: null,
          })
        } else if (session) {
          fillAuth(session)

          // this enables SSR with Supabase
          // TODO need for initial render? right now only executed on auth change
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
      }
    )

    return () => {
      if (authListener) authListener.unsubscribe()
    }
  }, [supabaseClient.auth])

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const authState = useAuthContext()

  async function signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<void> {
    try {
      // setAuthState({ ...authState, isLoading: true })
      const { error } = await signInSupabase(email, password)
      if (error) {
        console.error(error.message)
      } else {
        console.info('signed in')
      }
    } catch (error) {
      console.error(error)
    } finally {
      // setAuthState({ ...authState, isLoading: false })
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
      // setLoading(true)
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
    } finally {
      // setLoading(false)
    }
    return false
  }

  async function signOut() {
    await signOutSupabase()
  }

  return {
    ...authState,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signOut,
  }
}

export function useAuthContext(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(`useAuth must be used within the AuthContextProvider.`)
  }

  return context
}

export async function getUserByCookie(req: GetServerSidePropsContextRequest) {
  const res = await getUserByCookieSupabase(req)
  return { ...res, userAuth: res.user }
}

export async function signUp(email: string, password: string) {
  return await signUpSupabase(email, password)
}
