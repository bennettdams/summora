import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { Hydrate } from 'react-query'
import { UserPage } from '../../components/pages/UserPage'
import { hydrationHandler, prefillServer } from '../../data/use-user'
import {
  hydrationHandler as hydrationHandlerPosts,
  prefillServer as prefillServerPosts,
} from '../../data/use-user-posts'
import { dbFindUser, dbFindUserPosts } from '../../lib/db'
import { prisma } from '../../prisma/prisma'
import { ServerPageProps } from '../../types/PageProps'
import { ApiUser } from '../api/users/[userId]'
import { ApiUserPosts } from '../api/users/[userId]/posts'

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

type UserPageServerProps = UserPageProps &
  ServerPageProps & { dehydratedState2: ServerPageProps['dehydratedState'] }

export const getStaticProps: GetStaticProps<
  UserPageServerProps,
  Params
> = async ({ params }) => {
  if (!params) {
    // FIXME this is not really "not found", but rather a server error
    return { notFound: true }
  } else {
    const userId = params.userId
    const user: ApiUser = await dbFindUser(userId)

    if (!user) {
      return { notFound: true }
    } else {
      const client = hydrationHandler.createClient()
      prefillServer(client, userId, user)

      const userPosts: ApiUserPosts = await dbFindUserPosts(userId)

      const clientPosts = hydrationHandlerPosts.createClient()
      prefillServerPosts({ queryClient: clientPosts, userId, posts: userPosts })

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
        (acc, post) => acc + post.noOfLikes,
        0
      )
      const noOfViewsReceived = userPosts.reduce(
        (acc, post) => acc + post.noOfViews,
        0
      )

      return {
        props: {
          dehydratedState: hydrationHandler.dehydrate(client),
          dehydratedState2: hydrationHandlerPosts.dehydrate(clientPosts),
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
    <Hydrate state={hydrationHandler.deserialize(props.dehydratedState)}>
      <Hydrate
        state={hydrationHandlerPosts.deserialize(props.dehydratedState2)}
      >
        <UserPage userId={props.userId} userStatistics={props.userStatistics} />
      </Hydrate>
    </Hydrate>
  )
}
