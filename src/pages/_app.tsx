import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import { loggerLink } from '@trpc/client/links/loggerLink'
import { withTRPC } from '@trpc/next'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import superjson from 'superjson'
import { ErrorBoundary } from '../components/error'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { AppRouter } from '../server/routers/_app'
import { AuthContextProvider } from '../services/auth-service'
import { supabase } from '../services/supabase/supabase-service'
import '../styles/globals.css'

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

        <div className="font-light flex h-screen min-h-screen flex-col bg-dlight font-sans text-zinc-500 caret-dorange selection:bg-dlila selection:text-dbrown">
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

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // reference for render.com
  // if (process.env.RENDER_INTERNAL_HOSTNAME) {
  //   return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
  // }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export default withTRPC<AppRouter>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
      // url: `${getBaseUrl()}/api/trpc`,
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchInterval: false,
          },
        },
      },
      // for SSR, it is maybe needed to include the headers here from context
      // https://github.com/t3-oss/create-t3-app/issues/280
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  // ssr: true,
  /**
   * Set headers or status code when doing SSR
   */
  // responseMeta(opts) {
  //   const ctx = opts.ctx as SSRContext

  //   if (ctx.status) {
  //     // If HTTP status set, propagate that
  //     return {
  //       status: ctx.status,
  //     }
  //   }

  //   const error = opts.clientErrors[0]
  //   if (error) {
  //     // Propagate http first error from API calls
  //     return {
  //       status: error.data?.httpStatus ?? 500,
  //     }
  //   }
  //   // For app caching with SSR see https://trpc.io/docs/caching
  //   return {}
  // },
})(App)
