import { Page, PageSection } from '../components/Page'
import { LinkExternal } from '../components/link'

export default function _AboutPage() {
  return (
    <Page>
      <PageSection label="About">
        <div className="text-center text-xl">
          <LinkExternal to="https://twitter.com/bennettdams">
            <span>Created by</span>
            <span className="ml-1 underline">Bennett Dams</span>
            <span>.</span>
          </LinkExternal>

          <p>Feel free to contact me anytime, either via</p>

          <span className="mt-10">
            <LinkExternal to="https://twitter.com/bennettdams">
              Twitter
            </LinkExternal>
          </span>
          <span>or</span>
          <span>
            <LinkExternal to="mailto:summoraapp@gmail.com">Mail</LinkExternal>
          </span>
        </div>
      </PageSection>

      <PageSection label="Privacy policy">
        <div className="text-center">
          We don&apos;t store any personal data besides for authentication.
        </div>
      </PageSection>
    </Page>
  )
}
