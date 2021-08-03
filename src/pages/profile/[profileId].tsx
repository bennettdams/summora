import type { Prisma, PrismaClient } from '@prisma/client'
import type { GetServerSideProps } from 'next'
// import type { User } from '../../types/User'
import { ProfilePage } from '../../components/pages/ProfilePage'
// import { getUserByCookie } from '../../services/supabase/supabase-service'
import { prisma } from '../../prisma/prisma'

type Profile = Exclude<
  Prisma.PromiseReturnType<typeof findProfleByUserId>,
  null
>

export interface ProfilePageProps {
  profile: Profile | null
}

async function findProfleByUserId(prisma: PrismaClient, userId: string) {
  return await prisma.profile.findUnique({
    where: { userId },
  })
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
  // req,
}): Promise<
  { props: ProfilePageProps } | { props: { '404'?: null; '500'?: null } }
> => {
  // const { user } = await getUserByCookie(req)
  if (!params || typeof params.profileId !== 'string') {
    res.statusCode = 404
    return { props: { '404': null } }
  } else {
    const profile = await findProfleByUserId(prisma, params.profileId)

    return { props: { profile } }
  }
}

const ProfilePageSSR = ({ profile }: ProfilePageProps): JSX.Element => {
  return <ProfilePage profile={profile} />
}

export default ProfilePageSSR
