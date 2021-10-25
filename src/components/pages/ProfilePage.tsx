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
              <div className="flex">
                <div className="flex-grow">
                  <p>User ID {profile.userId}</p>
                  <p>Username {profile.username}</p>
                  <p>Created at {new Date(profile.createdAt).toISOString()}</p>
                  <p>Updated at {new Date(profile.updatedAt).toISOString()}</p>
                </div>
                <div>
                  <Avatar isEditable profileId={profile.userId} size="large" />
                </div>
              </div>
            </Box>
          </PageSection>

          <div>
            <button onClick={signOut}>Sign Out</button>
          </div>

          <PageSection>
            <Box>
              <h1 className="text-lg">Preview your avatar</h1>

              <div className="grid auto-rows-min grid-cols-3 text-center">
                <div className="col-start-1">
                  <div className="h-full grid place-items-center">
                    <Avatar profileId={profile.userId} size="small" />
                  </div>
                  <p>Small</p>
                </div>
                <div className="col-start-2">
                  <div className="h-full grid place-items-center">
                    <Avatar profileId={profile.userId} size="medium" />
                  </div>
                  <p>Medium</p>
                </div>
                <div className="col-start-3">
                  <div className="h-full grid place-items-center">
                    <Avatar profileId={profile.userId} size="large" />
                  </div>
                  <p>Large</p>
                </div>
              </div>
            </Box>
          </PageSection>
        </>
      )}
    </Page>
  )
}
