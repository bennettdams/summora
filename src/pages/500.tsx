import { useRouter } from 'next/router'
import { Button } from '../components/Button'
import { Page } from '../components/Page'
import { IconRefresh } from '../components/icons'
import { Link } from '../components/link'
import { Subtitle } from '../components/typography'
import { ROUTES } from '../services/routing'

export default function PageError404() {
  const router = useRouter()

  return (
    <Page>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mt-6">
          <Subtitle>There was an error.</Subtitle>
        </div>

        <p className="mt-6">
          {/* TODO Link the support mail */}
          Try reloading the page, otherwise please contact us.
        </p>

        <div className="mt-12">
          <Link to={ROUTES.signIn}>
            {/* TODO Should be a ButtonNav */}
            <Button icon={<IconRefresh />} onClick={() => router.reload()}>
              Reload page
            </Button>
          </Link>
        </div>
      </div>
    </Page>
  )
}
