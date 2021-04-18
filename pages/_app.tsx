import type { AppProps } from 'next/app'
import Head from 'next/head'
import Link from 'next/link'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../styles/globals.css'

export const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-100 via-teal-100 to-blue-300">
        <Head>
          <title>Condun</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="h-12 w-full top-0 fixed bg-lime-500">
          <Link href="/">Condu</Link>
          <div className="ml-32">
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  await fetch('api/seed')
                  queryClient.invalidateQueries('posts')
                }}
              >
                Seed
              </button>
            )}
          </div>
        </header>

        <Component {...pageProps} />

        <footer className="w-full h-24 border-t flex items-center justify-center">
          <p>Condun</p>
        </footer>

        {/* <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style> */}
      </div>
    </QueryClientProvider>
  )
}

export default App
