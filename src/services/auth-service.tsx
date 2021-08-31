import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  signInSupabase,
  signOutSupabase,
  signUpSupabase,
} from './supabase/supabase-service'
import { User } from '../types/User'
import { Session } from '../types/Session'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthContextProvider({
  supabaseClient,
  children,
}: {
  supabaseClient: SupabaseClient
  children: ReactNode
}): JSX.Element {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
  })

  useEffect(() => {
    const session = supabaseClient.auth.session()
    setAuthState({ session, user: session?.user ?? null, isLoading: false })

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({ session, user: session?.user ?? null, isLoading: false })

        // this enables SSR
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        }).then((res) => res.json())
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

export function useAuth(): Record<string, any> {
  const authState = useAuthContext()

  async function signInWithEmailAndUsername(
    email: string,
    password: string
  ): Promise<void> {
    try {
      // setAuthState({ ...authState, isLoading: true })
      const { error } = await signInSupabase(email, password)
      if (error) {
        console.error(error.message)
      } else {
        console.log('signed in')
      }
    } catch (error) {
      console.error(error.error_description || error.message)
    } finally {
      // setAuthState({ ...authState, isLoading: false })
    }
  }

  async function signUpWithEmailAndUsername(email: string, password: string) {
    try {
      // setLoading(true)
      const { error } = await signUpSupabase(email, password)
      if (error) throw error
      console.log('signed up')
    } catch (error) {
      console.error(error.error_description || error.message)
    } finally {
      // setLoading(false)
    }
  }

  async function signOut() {
    await signOutSupabase()
  }

  return {
    ...authState,
    signInWithEmailAndUsername,
    signUpWithEmailAndUsername,
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
