import { ProfilePageProps } from '../../pages/profile/[profileId]'
import { supabase } from '../../services/supabase/supabaseClient'
import { Page, PageSection } from '../Page'

export function ProfilePage({ user }: ProfilePageProps): JSX.Element {
  return (
    <Page>
      {!user ? (
        <p>Not signed in</p>
      ) : (
        <>
          <PageSection>
            <p>Email {user.email}</p>
          </PageSection>
          <p>a {JSON.stringify(user.aud)}</p>
          <p>a {user.email}</p>
          <p>a {user.id}</p>
          <p>a {JSON.stringify(user.user_metadata)}</p>

          <div>
            <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
        </>
      )}
    </Page>
  )
}
