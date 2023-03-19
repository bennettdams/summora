import { ROUTES } from '../services/routing'
import { Button } from './Button'
import { IconSignIn } from './Icon'
import { Link } from './link'

export function AuthenticateButton({
  isSignUp = false,
}: {
  isSignUp?: boolean
}): JSX.Element {
  return (
    <Link to={ROUTES.signIn}>
      {/* TODO Should be a ButtonNav */}
      <Button icon={<IconSignIn />} onClick={() => console.info('')}>
        {isSignUp ? 'Sign up' : 'Sign in'}
      </Button>
    </Link>
  )
}
