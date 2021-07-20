import { MouseEvent, useState } from 'react'
import { useAuth } from '../../services/auth-service'
import { Page, PageSection } from '../Page'

export function SignInPage(): JSX.Element {
  const { signInWithEmailAndUsername, signUpWithEmailAndUsername } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSignIn(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    // e.preventDefault()
    signInWithEmailAndUsername(email, password)
  }

  async function handleSignUp(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    // e.preventDefault()
    await signUpWithEmailAndUsername(email, password)
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
          <button onClick={handleSignIn} disabled={loading}>
            {loading ? <span>Loading</span> : <span>Sign in</span>}
          </button>
        </div>
        <div>
          <button onClick={handleSignUp} disabled={loading}>
            {loading ? <span>Loading</span> : <span>Sign up</span>}
          </button>
        </div>
      </PageSection>
    </Page>
  )
}
