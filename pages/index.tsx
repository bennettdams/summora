import Link from 'next/link'
import Head from 'next/head'
import { Page } from '../components/Page'
import ErrorPage from 'next/error'
import { LoadingAnimation } from '../components/LoadingAnimation'
import { usePosts } from '../data/post-helper'

export const Home = (): JSX.Element => {
  const { posts, isLoading, createPost } = usePosts()

  return (
    <Page>
      <Head>
        <title>Condun</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Welcome to Condun!</h1>
      {isLoading ? (
        <LoadingAnimation />
      ) : !posts ? (
        <ErrorPage statusCode={404}>Error while fetching posts</ErrorPage>
      ) : (
        <>
          <button
            onClick={async () => {
              try {
                await createPost({
                  title: 'title ' + Math.random(),
                  content: 'content' + Math.random(),
                  createdAt: new Date().toISOString(),
                })
              } catch (err) {
                console.log(err)
              }
            }}
          >
            New
          </button>
          <div className="flex-1 space-y-2">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className="bg-white cursor-pointer p-4">
                  <p>{post.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </Page>
  )
}

export default Home
