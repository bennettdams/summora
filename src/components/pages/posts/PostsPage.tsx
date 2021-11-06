import Head from 'next/head'
import ErrorPage from 'next/error'
import { PostsPageProps } from '../../../pages'
import { Box } from '../../Box'
import { Page, PageSection } from '../../Page'
import { Link } from '../../Link'
import { Views } from '../../Likes'
import { Comments } from '../../Comments'
import { Button } from '../../Button'
import { useState } from 'react'
import { Avatar } from '../../Avatar'

export function PostsPage({
  posts,
  postCategories,
  noOfPostsCreatedLast24Hours,
}: PostsPageProps): JSX.Element {
  const [showLongPost, setShowLongPost] = useState(true)

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

      <PageSection>
        <div className="flex flex-row space-x-10">
          <div className="flex-1">
            <Box>No. of posts {noOfPostsCreatedLast24Hours}</Box>
          </div>
          <div className="flex-1">
            <Box>{noOfPostsCreatedLast24Hours}</Box>
          </div>
          <div className="flex-1">
            <Box>{noOfPostsCreatedLast24Hours}</Box>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <p className="text-2xl italic">Find by category</p>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4 text-center text-lg">
          {postCategories.map((category) => (
            <Box smallPadding key={category.id}>
              <span className="hover:font-bold cursor-pointer">
                {category.title}
              </span>
            </Box>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <Button onClick={() => setShowLongPost(true)}>Long</Button>
        <Button onClick={() => setShowLongPost(false)}>Short</Button>
      </PageSection>

      {!posts ? (
        <ErrorPage statusCode={404}>Error while fetching posts</ErrorPage>
      ) : (
        <PageSection>
          {showLongPost ? (
            <div className="mt-10 flex flex-col space-y-10">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {posts.map((post) => (
                <PostItemShort key={post.id} post={post} />
              ))}
            </div>
          )}
        </PageSection>
      )}
    </Page>
  )
}

function PostItem({
  post,
}: {
  post: PostsPageProps['posts'][number]
}): JSX.Element {
  return (
    <Link to={`/post/${post.id}`}>
      <Box smallPadding>
        <div className="w-full h-80 text-center relative">
          <h2 className="tracking-widest text-xs font-medium text-gray-400">
            {post.category.title}
          </h2>
          <h1 className="mt-1 sm:text-2xl text-xl font-medium">{post.title}</h1>
          <p className="mt-3 leading-relaxed">{post.subtitle}</p>

          <div className="flex py-4 flex-row flex-nowrap h-ful overflow-y-auto space-x-4">
            {post.segments.map((segment) => {
              return (
                <div
                  key={segment.id}
                  className="flex-none grid place-items-center w-60 h-32 bg-blue-100 rounded-lg"
                >
                  {segment.title}
                </div>
              )
            })}
          </div>

          <div className="text-center mt-2 leading-none flex justify-center absolute bottom-0 w-full py-3 space-x-4">
            <Link to={`user/${post.authorId}`}>
              <div className="flex flex-row items-center space-x-4 hover:bg-lime-300">
                <span>{post.author.username}</span>
                <Avatar
                  hasUserAvatar={post.author.hasAvatar ?? false}
                  size="small"
                  userId={post.authorId}
                />
              </div>
            </Link>
            <Views>1.2K</Views>
            <Comments>6</Comments>
            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
              {post.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </Box>
    </Link>
  )
}

function PostItemShort({
  post,
}: {
  post: PostsPageProps['posts'][number]
}): JSX.Element {
  return (
    <Link to={`/post/${post.id}`}>
      <Box smallPadding>
        <div className="w-full h-60 text-center relative">
          <h2 className="tracking-widest text-xs font-medium text-gray-400">
            {post.category.title}
          </h2>
          <h1 className="mt-1 sm:text-2xl text-xl font-medium">{post.title}</h1>
          <p className="mt-3 leading-relaxed">{post.subtitle}</p>
          <div className="text-center mt-2 leading-none flex justify-center absolute bottom-0 w-full py-3 space-x-4">
            <Views>1.2K</Views>
            <Comments>6</Comments>
            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
              {post.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </Box>
    </Link>
  )
}
