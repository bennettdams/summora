import Head from 'next/head'
import Image from 'next/image'
import img from '../../../../public/assets/homepage-hero.jpg'
import { PostsPageProps } from '../../../pages'
import { ROUTES } from '../../../services/routing'
import { trpc } from '../../../util/trpc'
import { IconArrowCircleRight, IconLightning } from '../../Icon'
import { Link } from '../../link'
import { LoadingAnimation } from '../../LoadingAnimation'
import { NoContent } from '../../NoContent'
import { Page, PageSection } from '../../Page'
import { PostsList } from '../../post'
import { StatisticsCard } from '../../StatisticsCard'

export function PostsPage({
  noOfPosts,
  noOfPostsCreatedLast24Hours,
  noOfComments,
  noOfCommentsCreatedLast24Hours,
}: PostsPageProps): JSX.Element {
  const { data: posts, isLoading, isError } = trpc.posts.topByLikes.useQuery()

  return (
    <Page
      pageHeader={
        <div className="mt-20 grid place-items-center text-center">
          <div>
            <div className="relative grid h-96 place-items-center text-center text-4xl font-extrabold leading-none tracking-tight">
              <p className="z-10 bg-gradient-to-b from-dsecondary to-orange-300 decoration-clone bg-clip-text text-6xl uppercase text-transparent">
                Condun
              </p>

              {/* Background glow */}
              <div className="absolute top-0 h-96 w-96 rounded-full bg-dtertiary opacity-20 blur-2xl filter"></div>
              <div className="absolute top-0 h-56 w-96 rounded-full bg-dprimary opacity-30 blur-2xl filter"></div>
              <div className="absolute top-0 h-96 w-96 rounded-full bg-dsecondary opacity-20 blur-2xl filter"></div>

              <div className="absolute z-0">
                <Image
                  className="z-0 inline-block aspect-square rounded-full"
                  width={300}
                  height={300}
                  src={img}
                  alt="Homepage header image"
                />
              </div>
            </div>

            <p className="mt-2 text-center font-serif text-4xl font-extrabold leading-8 tracking-tight text-dprimary lg:text-5xl">
              Everything, but summarized.
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
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <StatisticsCard label="Posts" no={noOfPosts} />

          <StatisticsCard
            label="Posts (24 hours)"
            no={noOfPostsCreatedLast24Hours}
          />

          <StatisticsCard label="Comments" no={noOfComments} />

          <StatisticsCard
            label="Comments (24 hours)"
            no={noOfCommentsCreatedLast24Hours}
          />
        </div>
      </PageSection>

      <PageSection hideTopMargin>
        <div className="mx-auto mt-10 max-w-7xl">
          <div className="text-center">
            <p className="mt-2 font-serif text-4xl font-extrabold leading-8 tracking-tight text-dprimary">
              <span>A </span>
              <span className="underline decoration-dsecondary">
                faster
              </span>{' '}
              way to learn
            </p>
            <p className="mt-4 flex max-w-2xl flex-col text-xl lg:mx-auto">
              <span>
                Condun is home of an endless stream of articles in every
                category, generated by users. Each article summarizes the
                essentials of a topic.
              </span>
              <span>
                And if something is missing, <strong>you</strong> can create it!
              </span>
            </p>
          </div>
        </div>

        <Link to={ROUTES.explore}>
          <div className="mt-10 grid w-full place-items-center text-center">
            <div className="cursor-pointer rounded-lg py-6 hover:bg-dtertiary lg:py-10">
              <h1 className="px-20 font-serif text-4xl font-semibold tracking-wide text-dprimary underline decoration-dsecondary lg:text-5xl">
                Start exploring
                <span className="hidden w-full lg:ml-6 lg:inline lg:w-auto">
                  <IconArrowCircleRight size="huge" />
                </span>
              </h1>
              <span className="mt-4 block w-full lg:ml-4 lg:hidden lg:w-auto">
                <IconArrowCircleRight size="huge" />
              </span>
            </div>
          </div>
        </Link>
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-2 grid-rows-2 gap-8 md:px-44">
          <div className="justify-left flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconLightning size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              Every topic you can imagine
            </p>
          </div>

          <div className="justify-left flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconLightning size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              User-generated content
            </p>
          </div>

          <div className="justify-left flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconLightning size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              Get paid to write articles
            </p>
          </div>

          <div className="justify-left flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconLightning size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              Explore unknown knowledge territories
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-7xl py-12 lg:flex lg:items-center lg:justify-between lg:py-16">
          <h2 className="font-serif text-4xl font-extrabold tracking-tight text-dprimary lg:text-3xl">
            <span className="block">
              Ready to make your knowledge to money?
            </span>
            <span className="block text-dtertiary">
              Create an account for free today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-dprimary px-5 py-3 text-base font-semibold text-white hover:bg-dsecondary"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection label="Popular posts">
        {isLoading ? (
          <div className="grid place-items-center">
            <LoadingAnimation />
          </div>
        ) : isError ? (
          <NoContent>Error while loading posts.</NoContent>
        ) : !posts || posts.length === 0 ? (
          <NoContent>No posts found.</NoContent>
        ) : (
          <PostsList
            posts={posts.map((post) => ({
              id: post.id,
              categoryTitle: post.category.name,
              title: post.title,
              subtitle: post.subtitle,
              updatedAt: post.updatedAt,
              author: {
                id: post.authorId,
                username: post.author.username,
                imageId: post.author.imageId,
                imageBlurDataURL: post.author.imageBlurDataURL,
                imageFileExtension: post.author.imageFileExtension,
              },
              noOfViews: post.noOfViews,
              noOfComments: post._count.comments,
            }))}
          />
        )}
      </PageSection>
    </Page>
  )
}
