import { MouseEvent, useState } from 'react'
import { useAuth } from '../../services/auth-service'
import { LoadingAnimation } from '../LoadingAnimation'
import { Page, PageSection } from '../Page'

export function SignInPage(): JSX.Element {
  const { signInWithEmailAndUsername, signUpWithEmailAndUsername } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('a@b.com')
  const [password, setPassword] = useState('123456')

  async function handleSignIn(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    // e.preventDefault()
    setIsLoading(true)
    signInWithEmailAndUsername(email, password)
    setIsLoading(false)
  }

  async function handleSignUp(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    // e.preventDefault()
    setIsLoading(true)
    await signUpWithEmailAndUsername(email, password)
    setIsLoading(false)

    // const isSuccessfulSignUp = await signUpWithEmailAndUsername(email, password)
    // TODO go to some page
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
          <button onClick={handleSignIn} disabled={isLoading}>
            {isLoading ? <LoadingAnimation /> : <span>Sign in</span>}
          </button>
        </div>
        <div>
          <button onClick={handleSignUp} disabled={isLoading}>
            {isLoading ? <LoadingAnimation /> : <span>Sign up</span>}
          </button>
        </div>
      </PageSection>
    </Page>
  )
}
