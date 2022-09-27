import { User } from '@prisma/client'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { z } from 'zod'
import { useUser } from '../data/use-user'
import { GetServerSidePropsContextRequest } from '../types/GetServerSidePropsContextRequest = GetServerSidePropsContext'
import { Session } from '../types/Session'
import { UserAuth } from '../types/UserAuth'
import { apiUsersSignUp } from './api-service'
import {
  getUserByCookieSupabase,
  setUpSSRAuthSupabase,
  signInSupabase,
  signOutSupabase,
  signUpSupabase,
} from './supabase/supabase-service'

export interface AuthState {
  userAuth: UserAuth | null
  session: Session | null
  isLoading: boolean
  user: User | null
  userId: string | null
}

const AuthContext = createContext<AuthState | null>(null)

/** Wrapper to fetch user details (e.g. for avatar image URL). It is used so `userId` is not null. */
function UserDetailsWrapper({
  userId,
  setAuthState,
  children,
}: {
  userId: string
  setAuthState: Dispatch<SetStateAction<AuthState>>
  children: ReactNode
}): JSX.Element {
  const { user } = useUser(userId)

  useEffect(() => {
    if (user) setAuthState((prev) => ({ ...prev, isLoading: false, user }))
  }, [user, setAuthState])

  return <>{children}</>
}

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
      // set session without user details
      setAuthState({
        session,
        userAuth,
        isLoading: true,
        user: null,
        userId,
      })
    }
  }

  useEffect(() => {
    // #########
    // auth state for initial page load
    let isInitialized = false

    // initially fetch our user if session exists
    if (!isInitialized) {
      const sessionLocal: Session | null = supabaseClient.auth.session()
      if (sessionLocal) {
        fillAuth(sessionLocal)
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
      isInitialized = true
    }
    // #########

    // Supabase will not execute this on the initial render when the session already exists
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, sessionNew) => {
        if (event === 'SIGNED_OUT') {
          setAuthState({
            isLoading: false,
            session: null,
            user: null,
            userAuth: null,
            userId: null,
          })
        } else {
          if (!isInitialized && sessionNew) {
            fillAuth(sessionNew)
          }
        }

        // TODO needed for initial render? right now only executed on auth change
        await setUpSSRAuthSupabase(sessionNew, event)
      }
    )

    return () => {
      if (authListener) authListener.unsubscribe()
    }
  }, [supabaseClient.auth])

  return (
    <AuthContext.Provider value={authState}>
      {authState.userId ? (
        <UserDetailsWrapper
          userId={authState.userId}
          setAuthState={setAuthState}
        >
          {children}
        </UserDetailsWrapper>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const signInSchema = z.object({
  email: z.string().min(2, 'Username must contain at least 2 characters.'),
  password: z.string().min(6, 'Password must contain at least 6 characters.'),
})

export function useAuth() {
  const authState = useAuthContext()

  async function signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<void> {
    try {
      const parsed = signInSchema.parse({ email, password })
      // setAuthState({ ...authState, isLoading: true })
      const { error } = await signInSupabase(parsed)
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
