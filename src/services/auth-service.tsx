import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import { SupabaseClient, Session, User } from '@supabase/supabase-js'

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

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(`useAuth must be used within the AuthContextProvider.`)
  }

  return context
}
