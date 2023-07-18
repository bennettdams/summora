import { Page, PageSection } from '../components/Page'
import { IconMail } from '../components/icons'
import { LinkExternal } from '../components/link'

export default function _AboutPage() {
  return (
    <Page>
      <PageSection label="About">
        <div className="text-center text-xl">
          <LinkExternal to="https://twitter.com/bennettdams">
            <span className="italic">Created by</span>
            <span className="ml-1 underline">Bennett Dams</span>
          </LinkExternal>

          <div className="mt-20 w-full">
            <p>Feel free to contact me anytime!</p>
            <p className="mt-6 grid place-items-center">
              <LinkExternal
                to="https://twitter.com/bennettdams"
                className="flex flex-row"
              >
                <span className="text-dsecondary">
                  <svg
                    fill="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                </span>
                <span className="ml-1">Twitter</span>
              </LinkExternal>
            </p>

            <p className="mt-4">or</p>

            <p className="mt-4 grid place-items-center">
              <LinkExternal
                to="mailto:summoraapp@gmail.com"
                className="flex flex-row"
              >
                <span>
                  <IconMail />
                </span>
                <span className="ml-1">Mail</span>
              </LinkExternal>
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection label="Privacy policy">
        <div className="text-center">
          <p>
            We don&apos;t store any personal data besides the one used for
            authentication.
          </p>
          <p>
            When you sign in via Google, this includes the mail address, open ID
            and public profile.
          </p>
        </div>
      </PageSection>
    </Page>
  )
}
