import type { Prisma, PrismaClient } from '@prisma/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { Hydrate } from 'react-query'
import { UserPage } from '../../components/pages/UserPage'
import { hydrationHandler, prefillServer } from '../../data/use-user'
import { dbFindUser } from '../../lib/db'
import { prisma } from '../../prisma/prisma'
import {
  deserializeUserPosts,
  serialize,
} from '../../services/serialize-service'
import { ServerPageProps } from '../../types/PageProps'
import { ApiUser } from '../api/users/[userId]'

type UserStatistics = {
  noOfPostsCreated: number
  noOfCommentsWritten: number
  noOfLikesReceived: number
  noOfViewsReceived: number
}

export interface UserPageProps {
  userId: string
  /**
   * "posts" are not part of a typical user to not blow up the data,
   * as the user object is also used for comments etc.
   */
  posts: (Prisma.PromiseReturnType<typeof findUserPosts>[number] & {
    noOfLikes: number
  })[]
  userStatistics: UserStatistics
}

interface Params extends ParsedUrlQuery {
  userId: string
}

// TODO rather go posts -> user than user -> posts?
async function findUserPosts(prisma: PrismaClient, userId: string) {
  const userPosts = await prisma.user.findUnique({
    where: { userId },
    select: {
      posts: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        // include: { category: { select: { id: true } } },
        include: {
          author: {
            select: { username: true, imageId: true, imageBlurDataURL: true },
          },
          category: { select: { title: true } },
          segments: { orderBy: { createdAt: 'asc' } },
          tags: { select: { id: true, title: true } },
          /*
           * TODO
           * Using _count for implicit Many-To-Many relations does not work right now (30.11.2021),
           * that's why we can't use it for "likedBy".
           * https://github.com/prisma/prisma/issues/9880
           */
          // _count: { select: { comments: true, likedBy: true } },
          _count: { select: { comments: true } },
          likedBy: { select: { userId: true } },
        },
      },
    },
  })

  return userPosts?.posts ?? []
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

export const getStaticProps: GetStaticProps<
  UserPageProps & ServerPageProps,
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

      const userPosts: UserPageProps['posts'] = (
        await findUserPosts(prisma, userId)
      ).map((post) => ({
        ...post,
        noOfLikes: post.likedBy.length,
      }))

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
          userId,
          posts: serialize(userPosts),
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

export default function _UserPage(
  props: UserPageProps & ServerPageProps
): JSX.Element {
  return (
    <Hydrate state={hydrationHandler.deserialize(props.dehydratedState)}>
      <UserPage
        userId={props.userId}
        posts={deserializeUserPosts(props.posts)}
        userStatistics={props.userStatistics}
      />
    </Hydrate>
  )
}
