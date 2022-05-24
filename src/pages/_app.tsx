import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { AuthContextProvider } from '../services/auth-service'
import { supabase } from '../services/supabase/supabase-service'
import '../styles/globals.css'
import { ErrorBoundary } from '../components/error'

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ErrorBoundary>
      <AuthContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>
          <Head>
            <title>Condun</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="font-light flex h-screen min-h-screen flex-col bg-dlight font-sans text-zinc-500 caret-dorange selection:bg-dlila selection:text-dbrown">
            <Header />

            <div className="flex-grow overflow-y-auto">
              <main className="h-full">
                {/* boundary to catch errors where we can still show some UI (like the header and footer) */}
                <ErrorBoundary>
                  <Component {...pageProps} />
                </ErrorBoundary>
              </main>
            </div>

            <Footer />
          </div>
        </QueryClientProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  )
}

export default App
