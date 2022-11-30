import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { GetStaticProps } from 'next'
import { PostsPage } from '../components/pages/posts/PostsPage'
import { prisma } from '../server/db/client'
import { createPrefetchHelpersArgs } from '../server/prefetch-helpers'
import { ServerPageProps } from '../types/PageProps'

export type PostsPageProps = {
  noOfPosts: number
  noOfComments: number
  noOfPostsCreatedLast24Hours: number
  noOfCommentsCreatedLast24Hours: number
}

const revalidateInSeconds = 5 * 60

type Props = PostsPageProps & ServerPageProps

export const getStaticProps: GetStaticProps<Props> = async () => {
  const now = new Date()
  const nowYesterday = new Date(now.setHours(now.getHours() - 24))

  const ssg = createProxySSGHelpers(await createPrefetchHelpersArgs())

  const [
    noOfPosts,
    noOfComments,
    noOfPostsCreatedLast24Hours,
    noOfCommentsCreatedLast24Hours,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.postComment.count(),
    prisma.post.count({
      where: { createdAt: { gte: nowYesterday } },
    }),
    prisma.postComment.count({
      where: { createdAt: { gte: nowYesterday } },
    }),
    ssg.posts.some.prefetch(),
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
