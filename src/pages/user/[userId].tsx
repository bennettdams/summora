import { createProxySSGHelpers } from '@trpc/react/ssg'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { UserPage } from '../../components/pages/UserPage'
import { prisma } from '../../prisma/prisma'
import { createPrefetchHelpersArgs } from '../../server/prefetch-helpers'
import { PageProps } from '../../types/PageProps'

type UserStatistics = {
  noOfPostsCreated: number
  noOfCommentsWritten: number
  noOfLikesReceived: number
  noOfViewsReceived: number
}

export interface UserPageProps {
  userId: string
  userStatistics: UserStatistics
}

interface Params extends ParsedUrlQuery {
  userId: string
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    // TODO most popular users
    paths: [
      // { params: { id: '1' } },
      // { params: { id: '2' } }
    ],
    fallback: 'blocking',
  }
}

const revalidateInSeconds = 5 * 60

type UserPageServerProps = UserPageProps & PageProps

export const getStaticProps: GetStaticProps<
  UserPageServerProps,
  Params
> = async ({ params }) => {
  if (!params) {
    // FIXME this is not really "not found", but rather a server error
    return { notFound: true }
  } else {
    const userId = params.userId
    const ssg = createProxySSGHelpers(await createPrefetchHelpersArgs())
    const user = await ssg.user.byUserId.fetch({ userId })

    if (!user) {
      return { notFound: true }
    } else {
      await ssg.donationLink.byUserId.prefetch({ userId })
      await ssg.donationProvider.all.prefetch()
      const userPosts = await ssg.userPosts.byUserId.fetch({ userId })

      // STATISTICS
      const statisticsQuery = await prisma.user.findUnique({
        where: { userId },
        select: {
          _count: { select: { PostComment: true, posts: true } },
        },
      })
      const noOfPostsCreated = statisticsQuery?._count.posts ?? 0
      const noOfCommentsWritten = statisticsQuery?._count.PostComment ?? 0
      const noOfLikesReceived = userPosts.reduce(
        (acc, post) => acc + post._count.likedBy,
        0
      )
      const noOfViewsReceived = userPosts.reduce(
        (acc, post) => acc + post.noOfViews,
        0
      )

      return {
        props: {
          trpcState: ssg.dehydrate(),
          userId,
          userStatistics: {
            noOfPostsCreated,
            noOfCommentsWritten,
            noOfLikesReceived,
            noOfViewsReceived,
          },
        },
        revalidate: revalidateInSeconds,
      }
    }
  }
}

export default function _UserPage(props: UserPageServerProps): JSX.Element {
  return (
    <UserPage userId={props.userId} userStatistics={props.userStatistics} />
  )
}
