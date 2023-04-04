import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getProviders, signIn } from 'next-auth/react'
import Head from 'next/head'
import { Button } from '../components/Button'
import { Page } from '../components/Page'

type Providers = Awaited<ReturnType<typeof getProviders>>

export default function _SignInPage({ providers }: Props) {
  return (
    <>
      <Head>
        <title>Summora · Sign in</title>
      </Head>
      <Page>
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-dprimary">
                Sign in to your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Come back to correct that little typo. Or create a new post, you
                do you.
              </p>
            </div>

            <div className="rounded-xl bg-white p-8 shadow-xl">
              <p className="mt-2 text-center text-lg text-gray-600">
                For free, of course.
              </p>

              <div className="mt-8 flex items-center justify-center space-y-4">
                {!providers ? (
                  <p>No providers.</p>
                ) : (
                  Object.values(providers).map((provider) => (
                    <div key={provider.name}>
                      <Button
                        isBig
                        onClick={() =>
                          signIn(provider.id, { callbackUrl: '/' })
                        }
                      >
                        {provider.name}
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 flex items-center py-4">
                {/* left line */}
                <div className="h-px flex-grow bg-gray-300"></div>

                <span className="font-light flex-shrink px-4 italic">
                  Looking for other providers?
                </span>

                {/* right line */}
                <div className="h-px flex-grow bg-gray-300"></div>
              </div>

              <div className="flex flex-row items-center justify-center text-center">
                <span>Please let us know via Twitter:</span>
                <span className="inline-flex justify-center sm:mt-0 sm:justify-start">
                  <a className="ml-3">
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
                  </a>
                </span>
                <span>
                  <a
                    href="https://twitter.com/bennettdams"
                    className="ml-1"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    @bennettdams
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </>
  )
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

export const getServerSideProps: GetServerSideProps<{
  providers: Providers
}> = async () => {
  const providers = await getProviders()
  return {
    props: { providers },
  }
}
