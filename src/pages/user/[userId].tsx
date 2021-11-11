import type { PrismaClient } from '@prisma/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { Hydrate } from 'react-query'
import { UserPage } from '../../components/pages/UserPage'
import { hydrationHandler, prefillServer } from '../../data/use-user'
import { prisma } from '../../prisma/prisma'
import { ServerPageProps } from '../../types/PageProps'

export interface UserPageProps {
  userId: string
}

interface Params extends ParsedUrlQuery {
  userId: string
}

async function findUserByUserId(prisma: PrismaClient, userId: string) {
  return await prisma.user.findUnique({
    where: { userId },
  })
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

      return {
        props: {
          dehydratedState: hydrationHandler.dehydrate(client),
          userId,
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
      <UserPage userId={props.userId} />
    </Hydrate>
  )
}
