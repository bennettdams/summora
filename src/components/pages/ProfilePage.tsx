import { ProfilePageProps } from '../../pages/profile/[profileId]'
import { useAuth } from '../../services/auth-service'
import { Page, PageSection } from '../Page'
import { Avatar } from '../Avatar'
import { Box } from '../Box'

export function ProfilePage({ profile }: ProfilePageProps): JSX.Element {
  const { signOut } = useAuth()
  return (
    <Page>
      {!profile ? (
        <p>Profile does not exist.</p>
      ) : (
        <>
          <PageSection>
            <Box>
              <p>PROFILE</p>
              <p>User ID {profile.userId}</p>
              <p>Username {profile.username}</p>
              <p>Created at {new Date(profile.createdAt).toISOString()}</p>
              <p>Updated at {new Date(profile.updatedAt).toISOString()}</p>
            </Box>
          </PageSection>

          <div>
            <button onClick={signOut}>Sign Out</button>
          </div>

          <PageSection>
            <Box>
              <p>avatar</p>
              <Avatar profileId={profile.userId} size="small" />
              <Avatar profileId={profile.userId} size="medium" />
            </Box>
          </PageSection>
        </>
      )}
    </Page>
  )
}
