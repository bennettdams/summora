import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { AuthContextProvider } from '../services/auth-service'
import { supabase } from '../services/supabase/supabase-service'
import { ErrorBoundary } from 'react-error-boundary'
import '../styles/globals.css'
import { ErrorFallback } from '../components/ErrorFallback'

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      // onReset={() => {
      //   // reset the state of your app so the error doesn't happen again
      // }}
    >
      <AuthContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>
          <div className="m-0 box-border flex min-h-screen flex-col items-center justify-center bg-dlight p-0 font-sans text-zinc-500 caret-dorange selection:bg-dlila selection:text-dbrown">
            <Head>
              <title>Condun</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Component {...pageProps} />
            </ErrorBoundary>

            <Footer />
          </div>
        </QueryClientProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  )
}

export default App
