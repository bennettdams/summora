import { Page } from '../components/Page'
import { Title } from '../components/typography'

export default function _PageMaintenance() {
  return (
    <Page>
      <div className="flex h-full flex-col items-center justify-center">
        <Title>Maintenance</Title>

        <div className="mt-10">
          <p>
            We are maintaining Summora right now. Please check back in a few
            moments.
          </p>
        </div>
      </div>
    </Page>
  )
}
