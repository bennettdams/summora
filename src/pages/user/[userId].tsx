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

export interface UserPageProps {
  userId: string
  posts: Prisma.PromiseReturnType<typeof findUserPosts>
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
          author: { select: { username: true, hasAvatar: true } },
          category: { select: { title: true } },
          segments: { orderBy: { createdAt: 'asc' } },
          tags: { select: { id: true, title: true } },
          _count: { select: { comments: true } },
        },
      },
    },
  })

  return userPosts?.posts ?? null
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
    const user = await findUserByUserId(prisma, userId)

    if (!user) {
      return { notFound: true }
    } else {
      const client = hydrationHandler.createClient()
      prefillServer(client, userId, user)

      const userPosts = await findUserPosts(prisma, userId)

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

export default function _User(
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
