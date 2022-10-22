import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ErrorBoundary } from '../components/error'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { AuthContextProvider } from '../services/auth-service'
import { supabase } from '../services/supabase/supabase-service'
import '../styles/globals.css'
import { trpc } from '../util/trpc'

function App({ Component, pageProps }: AppProps): JSX.Element {
  // const [queryClient] = useState(() => new QueryClient())

  return (
    <ErrorBoundary>
      {/* tRPC already brings the `QueryClientProvider` */}
      {/* https://github.com/trpc/trpc/discussions/1594#discussioncomment-2303573 */}
      {/* <QueryClientProvider client={queryClient}> */}
      <AuthContextProvider supabaseClient={supabase}>
        <Head>
          <title>Condun</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="font-light flex h-screen min-h-screen flex-col bg-dlight font-sans text-gray-500 caret-dorange selection:bg-dlila selection:text-dbrown">
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
      </AuthContextProvider>
      {/* </QueryClientProvider> */}
    </ErrorBoundary>
  )
}

export default trpc.withTRPC(App)
