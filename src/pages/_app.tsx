import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'
import { ErrorBoundary } from '../components/error'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import '../styles/globals.css'
import { trpc } from '../util/trpc'

function App({ Component, pageProps }: AppProps): JSX.Element {
  // const [queryClient] = useState(() => new QueryClient())

  // Create a new Supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={true} />
      <SessionContextProvider supabaseClient={supabaseClient}>
        {/* tRPC already brings the `QueryClientProvider` */}
        {/* https://github.com/trpc/trpc/discussions/1594#discussioncomment-2303573 */}
        {/* <QueryClientProvider client={queryClient}> */}
        <Head>
          <title>Condun</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="font-light flex h-screen min-h-screen flex-col bg-dlight font-sans text-gray-500 caret-dprimary selection:bg-dprimary selection:text-dtertiary">
          <Header />

          <div className="flex-grow overflow-y-auto">
            <main className="h-full">
              {/* boundary to catch errors where we can still show some UI (like the header and footer) */}
              <ErrorBoundary>
                {/* <TailwindCSSBreakpoint /> */}
                <Component {...pageProps} />
              </ErrorBoundary>
            </main>
          </div>

          <Footer />
        </div>
        {/* </QueryClientProvider> */}
      </SessionContextProvider>
    </ErrorBoundary>
  )
}

export default trpc.withTRPC(App)
