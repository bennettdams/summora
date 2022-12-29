import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getProviders, signIn } from 'next-auth/react'
import { Button } from '../components/Button'
import { Page } from '../components/Page'
import { getServerAuthSession } from '../server/api-security'

type Providers = Awaited<ReturnType<typeof getProviders>>

export default function SignIn({ providers }: Props) {
  return (
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
                    <Button isBig onClick={() => signIn(provider.id)}>
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

            <p className="text-center">Please let us know via Twitter.</p>
          </div>
        </div>
      </div>
    </Page>
  )
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

export const getServerSideProps: GetServerSideProps<{
  providers: Providers
}> = async (ctx) => {
  const providers = await getProviders()
  return {
    props: { providers, session: await getServerAuthSession(ctx) },
  }
}
