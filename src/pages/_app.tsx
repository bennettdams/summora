import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { AuthContextProvider } from '../services/auth-service'
import { supabase } from '../services/supabase/supabase-service'
import '../styles/globals.css'

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <AuthContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <div className="m-0 box-border flex min-h-screen flex-col items-center justify-center bg-dlight p-0 font-sans text-zinc-500">
          <Head>
            <title>Condun</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <Header />

          <Component {...pageProps} />

          <Footer />
        </div>
      </QueryClientProvider>
    </AuthContextProvider>
  )
}

export default App
