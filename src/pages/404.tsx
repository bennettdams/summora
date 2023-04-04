import { Button } from '../components/Button'
import { IconHome } from '../components/Icon'
import { Page } from '../components/Page'
import { Link } from '../components/link'
import { Title } from '../components/typography'
import { ROUTES } from '../services/routing'

export default function _PageError404() {
  return (
    <Page>
      <div className="flex h-full flex-col items-center justify-center">
        <p className="font-serif text-9xl text-dsecondary">404</p>

        <Title>The page was not found.</Title>

        <div className="mt-10">
          <Link to={ROUTES.home}>
            {/* TODO Should be a ButtonNav */}
            <Button icon={<IconHome />} onClick={() => console.info('')}>
              Go back to home
            </Button>
          </Link>
        </div>
      </div>
    </Page>
  )
}
