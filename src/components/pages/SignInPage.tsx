import { useState } from 'react'
import { supabase } from '../../services/supabase/supabaseClient'
import { Page, PageSection } from '../Page'

export function SignInPage(): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signIn({ email, password })
      if (error) throw error
      console.log('signed in')
    } catch (error) {
      console.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      console.log('signed up')
    } catch (error) {
      console.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <PageSection hideTopMargin>
        <div>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Your pw"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleSignIn(email, password)
            }}
            disabled={loading}
          >
            {loading ? <span>Loading</span> : <span>Sign in</span>}
          </button>
        </div>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleSignUp(email, password)
            }}
            disabled={loading}
          >
            {loading ? <span>Loading</span> : <span>Sign up</span>}
          </button>
        </div>
      </PageSection>
    </Page>
  )
}
