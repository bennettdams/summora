import { createServerSideHelpers } from '@trpc/react-query/server'
import type { GetStaticProps } from 'next'
import { PostsPage } from '../components/pages/posts/PostsPage'
import { prisma } from '../server/db/client'
import { createPrefetchHelpersArgs } from '../server/prefetch-helpers'
import type { ServerPageProps } from '../types/PageProps'
import { createDateFromThePast } from '../util/date-helpers'

export type PostsPageProps = {
  noOfPosts: number
  noOfComments: number
  noOfPostsCreatedLast24Hours: number
  noOfCommentsCreatedLast24Hours: number
}

const revalidateInSeconds = 1

type Props = PostsPageProps & ServerPageProps

export const getStaticProps: GetStaticProps<Props> = async () => {
  const yesterday = createDateFromThePast('day')

  const ssg = createServerSideHelpers(await createPrefetchHelpersArgs())

  const [
    noOfPosts,
    noOfComments,
    noOfPostsCreatedLast24Hours,
    noOfCommentsCreatedLast24Hours,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.postComment.count(),
    prisma.post.count({
      where: { createdAt: { gte: yesterday } },
    }),
    prisma.postComment.count({
      where: { createdAt: { gte: yesterday } },
    }),
    ssg.posts.topByLikes.prefetch({
      dateToFilter: 'week',
      tagIdsToFilter: [],
      categoryIdsToFilter: [],
    }),
  ])

  return {
    props: {
      trpcState: ssg.dehydrate(),
      noOfPosts,
      noOfPostsCreatedLast24Hours,
      noOfComments,
      noOfCommentsCreatedLast24Hours,
    },
    revalidate: revalidateInSeconds,
  }
}

export default function _HomePage(props: Props): JSX.Element {
  return (
    <PostsPage
      noOfPosts={props.noOfPosts}
      noOfPostsCreatedLast24Hours={props.noOfPostsCreatedLast24Hours}
      noOfComments={props.noOfComments}
      noOfCommentsCreatedLast24Hours={props.noOfCommentsCreatedLast24Hours}
    />
  )
}
