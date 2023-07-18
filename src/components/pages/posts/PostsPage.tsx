import Head from 'next/head'
import Image from 'next/image'
import img from '../../../../public/assets/summora-logo.png'
import { PostsPageProps } from '../../../pages'
import { useAuth } from '../../../services/auth-service'
import { ROUTES } from '../../../services/routing'
import { trpc } from '../../../util/trpc'
import { AuthenticateButton } from '../../AuthenticateButton'
import { Button } from '../../Button'
import { CreatePostModal } from '../../CreatePostModal'
import {
  IconExplore,
  IconIdea,
  IconKnowledge,
  IconLightning,
  IconMoney,
} from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { Page, PageSection } from '../../Page'
import { StatisticsCard } from '../../StatisticsCard'
import { Link } from '../../link'
import { PostsList } from '../../post-reusable'
import { NoContent } from '../../typography'

export function PostsPage({
  noOfPosts,
  noOfPostsCreatedLast24Hours,
  noOfComments,
  noOfCommentsCreatedLast24Hours,
}: PostsPageProps): JSX.Element {
  const {
    data: posts,
    isLoading,
    isError,
  } = trpc.posts.topByLikes.useQuery({
    dateFromPast: 'week',
    tagIdsToFilter: [],
    categoryIdsToFilter: [],
  })

  const { userIdAuth, isLoadingAuth } = useAuth()

  return (
    <Page
      pageHeader={
        <div className="mt-20 grid place-items-center text-center">
          <div>
            <div className="relative grid h-64 place-items-center text-center text-4xl font-extrabold leading-none tracking-tight lg:h-80">
              {/* Background glow */}
              <div className="absolute top-0 h-64 w-64 rounded-full bg-dtertiary opacity-20 blur-2xl filter lg:h-80 lg:w-80"></div>
              <div className="absolute top-0 h-56 w-64 rounded-full bg-dprimary opacity-30 blur-2xl filter lg:w-80"></div>
              <div className="absolute top-0 h-64 w-64 rounded-full bg-dsecondary opacity-20 blur-2xl filter lg:h-80 lg:w-80"></div>

              <div className="relative h-48 w-48 lg:h-64 lg:w-64">
                <Image
                  className="z-0 inline-block object-contain"
                  src={img}
                  alt="Homepage header image"
                  fill={true}
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 50vw"
                />
              </div>
            </div>

            <div className="text-center text-6xl font-extrabold leading-none tracking-tight lg:text-7xl">
              <p className="bg-gradient-to-b from-dprimary to-dtertiary decoration-clone bg-clip-text uppercase text-transparent">
                Summora
              </p>
            </div>

            <div className="mt-4 break-words text-center font-serif text-4xl font-extrabold leading-8 tracking-tight text-dsecondary md:inline-block lg:text-5xl">
              <p className="md:inline">Everything,</p>
              <p className="md:ml-2 md:inline-block">
                <span>in summary.</span>
              </p>
            </div>
          </div>
        </div>
      }
    >
      <Head>
        <title>Summora</title>
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
            <div className="mt-2 break-words text-center font-serif text-4xl font-extrabold leading-8 tracking-tight text-dprimary md:inline-block">
              <p className="md:inline">Less fluff,</p>
              <p className="md:ml-2 md:inline-block">
                <span>more</span>
                <span className="ml-2 underline decoration-dsecondary">
                  facts
                </span>
                <span>.</span>
              </p>
            </div>

            <p className="mt-4 flex max-w-2xl flex-col text-xl lg:mx-auto">
              <span>
                Summora is home of an endless stream of articles for any
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
            <Button
              variant="secondary"
              isBig={true}
              icon={<IconExplore size="huge" />}
            >
              <h1 className="text-2xl">Start exploring</h1>
            </Button>
          </div>
        </Link>
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 gap-8 md:px-44 lg:grid-cols-2">
          <div className="flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconIdea size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              Every topic you can imagine
            </p>
          </div>

          <div className="flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconLightning size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              User-generated content
            </p>
          </div>

          <div className="flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconMoney size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              Get paid to write articles
            </p>
          </div>

          <div className="flex items-center">
            <div className="rounded-md bg-dsecondary p-3">
              <IconKnowledge size="big" className="text-white" />
            </div>

            <p className="ml-6 text-lg font-semibold leading-6">
              Explore unknown knowledge territories
            </p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 gap-8 md:px-44 lg:grid-cols-4">
          <div className="col-span-3 flex items-center">
            <h2 className="font-serif text-4xl font-extrabold tracking-tight text-dprimary lg:text-3xl">
              <span className="block">
                Ready to make your knowledge to money?
              </span>
              <span className="block text-dtertiary">
                {!userIdAuth
                  ? 'Create an account for free today.'
                  : 'Create a post and see where it goes.'}
              </span>
            </h2>
          </div>
          <div className="col-span-1 flex items-center justify-center lg:justify-start">
            {!userIdAuth ? (
              <AuthenticateButton isLoading={isLoadingAuth} isSignUp={true} />
            ) : (
              <CreatePostModal />
            )}
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
