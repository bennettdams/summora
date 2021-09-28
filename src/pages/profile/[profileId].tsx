import type { Prisma, PrismaClient } from '@prisma/client'
import type { GetServerSideProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { ProfilePage } from '../../components/pages/ProfilePage'
import { prisma } from '../../prisma/prisma'

type Profile = Exclude<
  Prisma.PromiseReturnType<typeof findProfleByUserId>,
  null
>

export interface ProfilePageProps {
  profile: Profile | null
}

interface Params extends ParsedUrlQuery {
  profileId: string
}

async function findProfleByUserId(prisma: PrismaClient, userId: string) {
  return await prisma.profile.findUnique({
    where: { userId },
  })
}

export const getServerSideProps: GetServerSideProps<ProfilePageProps, Params> =
  async ({ params, res }) => {
    if (!params) {
      console.log(
        `[SSR] ${_Profile.name} page | ${'no profile ID, redirecting'}`
      )

      // TODO 404 redirect?
      res.statusCode = 404
      return { props: { profile: null } }
    } else {
      console.log(`[SSR] ${_Profile.name} page | ${params.profileId}`)

      const profile = await findProfleByUserId(prisma, params.profileId)

      return { props: { profile } }
    }
  }

export default function _Profile(props: ProfilePageProps): JSX.Element {
  return <ProfilePage profile={props.profile} />
}
