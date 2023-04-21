import { ROUTES } from '../services/routing'
import { Button } from './Button'
import { IconSignIn } from './Icon'
import { LoadingAnimation } from './LoadingAnimation'
import { Link } from './link'

export function AuthenticateButton({
  isLoading,
  isSignUp = false,
}: {
  isLoading: boolean
  isSignUp?: boolean
}): JSX.Element {
  const isSignInActive = Boolean(process.env.NEXT_PUBLIC_IS_SIGN_IN_ACTIVE)
  return (
    <>
      {isLoading ? (
        <LoadingAnimation />
      ) : !isSignInActive ? (
        <span className="max-w-[8rem] text-center text-sm">
          Sign in disabled temporarily.
        </span>
      ) : (
        <Link to={ROUTES.signIn}>
          {/* TODO Should be a ButtonNav */}
          <Button icon={<IconSignIn />} onClick={() => console.info('')}>
            {isSignUp ? 'Sign up' : 'Sign in'}
          </Button>
        </Link>
      )}
    </>
  )
}
