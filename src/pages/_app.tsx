import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { AuthContextProvider } from '../services/auth-service'
import { supabase } from '../services/supabase/supabaseClient'
import '../styles/globals.css'

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <AuthContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen p-0 m-0 font-sans box-border flex flex-col text-lime-700 items-center justify-center bg-gradient-to-br from-lime-400 to-teal-300">
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
