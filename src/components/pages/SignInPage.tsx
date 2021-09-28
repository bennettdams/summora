import { MouseEvent, useState } from 'react'
import { useAuth } from '../../services/auth-service'
import { LoadingAnimation } from '../LoadingAnimation'
import { Page, PageSection } from '../Page'

export function SignInPage(): JSX.Element {
  const { signInWithEmailAndPassword, signUpWithEmailAndPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_USERNAME ?? ''
  )
  const [email, setEmail] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? ''
  )
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_PASSWORD ?? ''
  )

  async function handleSignIn(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    // e.preventDefault()
    setIsLoading(true)
    signInWithEmailAndPassword(email, password)
    setIsLoading(false)
  }

  async function handleSignUp(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    // e.preventDefault()
    setIsLoading(true)
    await signUpWithEmailAndPassword(username, email, password)
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
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
