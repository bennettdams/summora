import Head from 'next/head'
import { Page, PageSection } from '../components/Page'
import ErrorPage from 'next/error'
import { LoadingAnimation } from '../components/LoadingAnimation'
import { usePosts } from '../data/post-helper'
import { Link } from '../components/Link'
import { Post } from '.prisma/client'
import { Box } from '../components/Box'

export const Home = (): JSX.Element => {
  const { posts, isLoading, createPost } = usePosts()

  return (
    <Page>
      <Head>
        <title>Condun</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center text-7xl font-extrabold leading-none tracking-tight">
        <span className="uppercase decoration-clone bg-clip-text text-transparent bg-gradient-to-b from-amber-400 to-orange-800">
          Condun
        </span>
      </div>

      {isLoading ? (
        <LoadingAnimation />
      ) : !posts ? (
        <ErrorPage statusCode={404}>Error while fetching posts</ErrorPage>
      ) : (
        <>
          <PageSection>
            <button
              className="p-10 bg-green-300"
              onClick={async () => {
                try {
                  await createPost({
                    title: 'title ' + Math.random(),
                    subtitle: 'subtitle ' + Math.random(),
                  })
                } catch (err) {
                  console.log(err)
                }
              }}
            >
              New
            </button>
          </PageSection>
          <PageSection>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          </PageSection>
        </>
      )}
    </Page>
  )
}

export default Home

function PostItem({ post }: { post: Post }): JSX.Element {
  return (
    <Link to={`/post/${post.id}`}>
      <Box noPadding>
        <div className="w-full p-4 h-60 bg-gradient-to-b from-fuchsia-50 to-blue-50 rounded-xl text-center relative">
          <h2 className="tracking-widest text-xs font-medium text-gray-400">
            CATEGORY
          </h2>
          <h1 className="mt-1 sm:text-2xl text-xl font-medium">{post.title}</h1>
          <p className="mt-3 leading-relaxed">{post.subtitle}</p>
          <div className="text-center mt-2 leading-none flex justify-center absolute bottom-0 w-full py-3 space-x-4">
            <span className="text-gray-400 inline-flex items-center leading-none text-sm py-1">
              <svg
                className="w-4 h-4 mr-1"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              1.2K
            </span>
            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
              <svg
                className="w-4 h-4 mr-1"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
              </svg>
              6
            </span>
            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
              {post.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </Box>
    </Link>
  )
}
