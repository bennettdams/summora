import Head from 'next/head'
import ErrorPage from 'next/error'
import { PostsPageProps } from '../../../pages'
import { Box } from '../../Box'
import { Page, PageSection } from '../../Page'
import { LightningBoltIcon } from '@heroicons/react/outline'
import { usePosts } from '../../../data/use-posts'
import { PostsList } from '../../post'

export function PostsPage({
  postCategories,
  noOfPosts,
  noOfPostsCreatedLast24Hours,
  noOfComments,
  noOfCommentsCreatedLast24Hours,
}: PostsPageProps): JSX.Element {
  const { posts } = usePosts()

  return (
    <Page
      pageHeader={
        <div className="mt-20 grid place-items-center text-center">
          <div>
            <div className="text-center text-4xl font-extrabold leading-none tracking-tight">
              <p className="bg-gradient-to-b from-amber-200 to-orange-300 decoration-clone bg-clip-text text-8xl uppercase text-transparent">
                Condun
              </p>
              <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-lime-600 sm:text-4xl">
                Everything, but summarized.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <Head>
        <title>Condun</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageSection hideTopMargin>
        <div className="flex flex-row space-x-10">
          <div className="flex-1 text-center">
            <p className="text-xl">Posts</p>
            <p className="mt-1 text-5xl text-orange-400">{noOfPosts}</p>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xl">Posts (24 hours)</p>
            <p className="mt-1 text-5xl text-orange-400">
              {noOfPostsCreatedLast24Hours}
            </p>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xl">Comments</p>
            <p className="mt-1 text-5xl text-orange-400">{noOfComments}</p>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xl">Comments (24 hours)</p>
            <p className="mt-1 text-5xl text-orange-400">
              {noOfCommentsCreatedLast24Hours}
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div>
          <div className="mx-auto max-w-7xl">
            <div className="lg:text-center">
              <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">
                User-generated content
              </h2>
              <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight sm:text-4xl">
                A better way to learn
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Lorem ipsum dolor sit amet consect adipisicing elit. Possimus
                magnam voluptatum cupiditate veritatis in accusamus quisquam.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
                <div className="relative">
                  <dt>
                    <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg font-semibold leading-6 text-gray-900">
                      Feature 1
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">Desc</dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg font-semibold leading-6 text-gray-900">
                      Feature 2
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">Desc</dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg font-semibold leading-6 text-gray-900">
                      Feature 3
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">Desc</dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white">
                      <LightningBoltIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 text-lg font-semibold leading-6 text-gray-900">
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

      <PageSection title="Find by category">
        <div className="grid grid-cols-2 gap-6 text-center text-lg md:grid-cols-4">
          {postCategories.map((category) => (
            <Box padding="small" key={category.id}>
              <span className="hover:font-bold cursor-pointer">
                {category.title}
              </span>
            </Box>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-7xl py-12 lg:flex lg:items-center lg:justify-between lg:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="block">
              Ready to make your knowledge to money?
            </span>
            <span className="block text-orange-400">
              Create an account for free today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-semibold text-white hover:bg-indigo-700"
              >
                Sign Up
              </a>
            </div>
            {/* <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-semibold rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Learn more
              </a>
            </div> */}
          </div>
        </div>
      </PageSection>

      {!posts ? (
        <ErrorPage statusCode={404}>Error while fetching posts</ErrorPage>
      ) : (
        <PageSection title="Popular posts">
          <PostsList
            posts={
              !posts
                ? null
                : posts.map((post) => ({
                    id: post.id,
                    categoryTitle: post.category.title,
                    title: post.title,
                    subtitle: post.subtitle,
                    updatedAt: post.updatedAt,
                    author: {
                      id: post.authorId,
                      username: post.author.username,
                      hasAvatar: post.author.hasAvatar,
                    },
                    noOfViews: post.noOfViews,
                    noOfComments: post._count?.comments ?? 0,
                    noOfLikes: post.noOfLikes,
                    likedBy: post.likedBy,
                    segments: post.segments,
                    tags: post.tags,
                  }))
            }
          />
        </PageSection>
      )}
    </Page>
  )
}
