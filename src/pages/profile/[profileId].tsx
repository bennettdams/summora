import { User } from '@supabase/supabase-js'
import { GetServerSideProps } from 'next'
import { ProfilePage } from '../../components/pages/ProfilePage'
import { supabase } from '../../services/supabase/supabaseClient'

export interface ProfilePageProps {
  user: User | null
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
}): Promise<
  { props: ProfilePageProps } | { props: { '404'?: null; '500'?: null } }
> => {
  const { user } = await supabase.auth.api.getUserByCookie(req)
  return { props: { user } }
}

const ProfilePageSSR = ({ user }: ProfilePageProps): JSX.Element => {
  return <ProfilePage user={user} />
}

export default ProfilePageSSR
