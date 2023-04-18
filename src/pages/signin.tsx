import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getProviders, signIn } from 'next-auth/react'
import Head from 'next/head'
import { Page } from '../components/Page'
import { Link } from '../components/link'
import { Logo } from '../components/logo'
import { ROUTES } from '../services/routing'

type Providers = Awaited<ReturnType<typeof getProviders>>

export default function _SignInPage({ providers }: Props) {
  const providerGoogle = !providers
    ? null
    : Object.values(providers).find((provider) => provider.id === 'google') ??
      null

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
              <p className="mt-2 text-center text-lg">For free, of course.</p>

              <div className="mt-8 flex items-center justify-center space-y-4">
                {!providerGoogle ? (
                  <p>Sign in is disabled temporarily.</p>
                ) : (
                  <button
                    onClick={() =>
                      signIn(providerGoogle.id, { callbackUrl: '/' })
                    }
                  >
                    <Logo topic="signin" logoIdForAccess="GOOGLE_SIGNIN" />
                  </button>
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
                <Link to={ROUTES.about}>
                  <span className="underline">Please contact us</span>
                  <span>.</span>
                </Link>
              </div>
            </div>

            <p className="mt-0 text-center text-sm tracking-widest">
              <Link to={ROUTES.about}>Privacy policy and more about us</Link>
            </p>
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
