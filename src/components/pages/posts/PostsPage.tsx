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
import { LightningBoltIcon } from '@heroicons/react/outline'
import { usePosts } from '../../../data/use-posts'
import { ApiPosts } from '../../../pages/api/posts'

export function PostsPage({
  postCategories,
  noOfPosts,
  noOfPostsCreatedLast24Hours,
}: PostsPageProps): JSX.Element {
  const [showLongPost, setShowLongPost] = useState(true)
  const { posts } = usePosts()

  return (
    <Page
      pageHeader={
        <div className="h-96 grid place-items-center bg-gradient-to-tr from-amber-300 to-lime-600 text-center">
          <div>
            <p className="uppercase text-7xl text-white font-extrabold leading-none tracking-tight">
              Condun
            </p>
            <p className="mt-2 text-3xl text-lime-100 leading-8 font-extrabold tracking-tight sm:text-4xl">
              Everything, but summarized
            </p>
          </div>
        </div>
      }
    >
      <Head>
        <title>Condun</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageSection hideTopMargin>
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                User-generated content
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
                A better way to learn
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Lorem ipsum dolor sit amet consect adipisicing elit. Possimus
                magnam voluptatum cupiditate veritatis in accusamus quisquam.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Feature 1
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">Desc</dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Feature 2
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">Desc</dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Feature 3
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">Desc</dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Feature 4
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">Desc</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="flex flex-row space-x-10">
          <div className="flex-1">
            <Box>No. of posts {noOfPosts}</Box>
          </div>
          <div className="flex-1">
            <Box>No. of posts last 24 hours{noOfPostsCreatedLast24Hours}</Box>
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

function PostItem({ post }: { post: ApiPosts[number] }): JSX.Element {
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

function PostItemShort({ post }: { post: ApiPosts[number] }): JSX.Element {
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
