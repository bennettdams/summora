import type { Prisma, PrismaClient } from '@prisma/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { Hydrate } from 'react-query'
import { UserPage } from '../../components/pages/UserPage'
import { hydrationHandler, prefillServer } from '../../data/use-user'
import { prisma } from '../../prisma/prisma'
import {
  deserializeUserPosts,
  serialize,
} from '../../services/serialize-service'
import { ServerPageProps } from '../../types/PageProps'
import { ApiUser } from '../api/users/[userId]'

export interface UserPageProps {
  userId: string
  /**
   * "posts" are not part of a typical user to not blow up the data,
   * as the user object is also used for comments etc.
   */
  posts: (Prisma.PromiseReturnType<typeof findUserPosts>[number] & {
    noOfLikes: number
  })[]
}

interface Params extends ParsedUrlQuery {
  userId: string
}

async function findUserByUserId(prisma: PrismaClient, userId: string) {
  return await prisma.user.findUnique({
    where: { userId },
  })
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
          author: { select: { username: true, imageId: true } },
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
    const user: ApiUser = await findUserByUserId(prisma, userId)

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

      return {
        props: {
          dehydratedState: hydrationHandler.dehydrate(client),
          userId,
          posts: serialize(userPosts),
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
      />
    </Hydrate>
  )
}
