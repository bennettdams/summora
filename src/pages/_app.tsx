import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import { DM_Serif_Display, Nunito } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { ErrorBoundary } from '../components/error'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import '../styles/globals.css'
import { trpc } from '../util/trpc'

const globalFont = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '800'],
  variable: '--global-condun-font',
  display: 'swap',
})

const globalFontSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--global-condun-font-serif',
  display: 'swap',
})

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter()

  /**
   * This is a hack to automatically scroll to the top of a page when the user navigates
   * to another route.
   * Usually this is done via `Link`'s `scroll` attribute. In our case, it is not the page who
   * is scrollable, but only the container containing the page content, so we have to do it manually.
   * See: https://github.com/vercel/next.js/discussions/45715
   */
  const mainContentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0
      }
    })
  }, [router.events])

  // const [queryClient] = useState(() => new QueryClient())

  return (
    <ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={true} />
      <SessionProvider session={session}>
        {/* tRPC already brings the `QueryClientProvider` */}
        {/* https://github.com/trpc/trpc/discussions/1594#discussioncomment-2303573 */}
        {/* <QueryClientProvider client={queryClient}> */}
        <Head>
          <title>Condun</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div
          className={`${globalFont.variable} ${globalFontSerif.variable} font-light flex h-screen min-h-screen flex-col bg-dlight font-sans text-gray-500 decoration-dsecondary caret-dprimary selection:bg-dprimary selection:text-dtertiary`}
        >
          <Header />

          <div ref={mainContentRef} className="flex-grow overflow-y-auto">
            {/* Horizontal overflow disabled because on iOS Safari the user would move the page while scrolling vertically otherwise. */}
            <main className="h-full overflow-x-hidden">
              {/* boundary to catch errors where we can still show some UI (like the header and footer) */}
              <ErrorBoundary>
                {/* <TailwindCSSBreakpoint /> */}
                <Component {...pageProps} />
                <Analytics />
              </ErrorBoundary>
            </main>
          </div>

          <Footer />
        </div>
        {/* </QueryClientProvider> */}
      </SessionProvider>
    </ErrorBoundary>
  )
}

export default trpc.withTRPC(App)
