import type { Prisma, PrismaClient } from '@prisma/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { UserPage } from '../../components/pages/UserPage'
import { prisma } from '../../prisma/prisma'

export interface UserPageProps {
  // exclude null, because the page will return "notFound" if user is null
  user: Exclude<Prisma.PromiseReturnType<typeof findUserByUserId>, null>
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

const revalidateInSeconds = 10 * 60

export const getStaticProps: GetStaticProps<UserPageProps, Params> = async ({
  params,
}) => {
  if (!params) {
    // FIXME this is not really "not found", but rather a server error
    return { notFound: true }
  } else {
    const userId = params.userId
    const user = await findUserByUserId(prisma, userId)

    if (!user) {
      return { notFound: true }
    } else {
      return {
        props: {
          user,
        },
        revalidate: revalidateInSeconds,
      }
    }
  }
}

export default function _User(props: UserPageProps): JSX.Element {
  return <UserPage user={props.user} />
}
