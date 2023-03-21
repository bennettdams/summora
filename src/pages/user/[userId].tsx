import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { UserPage } from '../../components/pages/UserPage'
import { prisma } from '../../server/db/client'
import { createPrefetchHelpersArgs } from '../../server/prefetch-helpers'
import { ServerPageProps } from '../../types/PageProps'
import { isPromiseFulfilled } from '../../util/utils'

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

type UserPageServerProps = UserPageProps & ServerPageProps

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
      const [userPosts, statistics] = await Promise.allSettled([
        ssg.posts.someByUserId.fetch({ userId }),
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            _count: { select: { comments: true, posts: true } },
          },
        }),
        ssg.donationLink.byUserId.prefetch({ userId }),
        ssg.donationProvider.all.prefetch(),
      ])

      // STATISTICS
      let noOfPostsCreated = 0
      let noOfCommentsWritten = 0
      if (isPromiseFulfilled(statistics)) {
        noOfPostsCreated = statistics.value?._count.posts ?? 0
        noOfCommentsWritten = statistics.value?._count.comments ?? 0
      }

      let noOfLikesReceived = 0
      let noOfViewsReceived = 0
      if (isPromiseFulfilled(userPosts)) {
        noOfLikesReceived = userPosts.value.reduce(
          (acc, post) => acc + post._count.likedBy,
          0
        )
        noOfViewsReceived = userPosts.value.reduce(
          (acc, post) => acc + post.noOfViews,
          0
        )
      }

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
