import Head from 'next/head'

export const Home = (): JSX.Element => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-lime-50">
    <Head>
      <title>Condu</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <header className="h-12 w-full top-0 fixed bg-lime-500">Condu</header>

    <main className="flex-1 mt-20 flex flex-col">
      <h1 className="bg-red-200">Welcome to Condu!</h1>
    </main>

    <footer className="w-full h-24 border-t flex items-center justify-center">
      <p>Condun</p>
    </footer>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }

      * {
        box-sizing: border-box;
      }
    `}</style>
  </div>
)

export default Home
