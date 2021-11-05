import type { Prisma, PrismaClient } from '@prisma/client'
import type { GetServerSideProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { UserPage } from '../../components/pages/UserPage'
import { prisma } from '../../prisma/prisma'

export interface UserPageProps {
  user: Prisma.PromiseReturnType<typeof findUserByUserId>
}

interface Params extends ParsedUrlQuery {
  userId: string
}

async function findUserByUserId(prisma: PrismaClient, userId: string) {
  return await prisma.user.findUnique({
    where: { userId },
  })
}

export const getServerSideProps: GetServerSideProps<UserPageProps, Params> =
  async ({ params, res }) => {
    if (!params) {
      console.log(`[SSR] ${_User.name} page | ${'404, no parms'}`)

      // TODO 404 redirect?
      res.statusCode = 404
      return { props: { user: null } }
    } else {
      const userId = params.userId

      if (!userId) {
        console.log(`[SSR] ${_User.name} page | ${'404, no user ID'}`)

        res.statusCode = 404
        return { props: { user: null } }
      } else {
        console.log(`[SSR] ${_User.name} page | ${userId}`)

        const user = await findUserByUserId(prisma, userId)

        if (!user) {
          return { notFound: true }
        } else {
          return { props: { user } }
        }
      }
    }
  }

export default function _User(props: UserPageProps): JSX.Element {
  return <UserPage user={props.user} />
}
