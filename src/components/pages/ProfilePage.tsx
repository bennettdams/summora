import { ProfilePageProps } from '../../pages/profile/[profileId]'
import { useAuth } from '../../services/auth-service'
import { Page, PageSection } from '../Page'
// import { Avatar } from '../Avatar'

export function ProfilePage({ profile }: ProfilePageProps): JSX.Element {
  const { signOut } = useAuth()
  return (
    <Page>
      {!profile ? (
        <p>Profile does not exist.</p>
      ) : (
        <>
          <PageSection>
            <p>PROFILE</p>
            <p>User ID {profile.userId}</p>
            <p>Username {profile.username}</p>
            <p>Created at {new Date(profile.createdAt).toISOString()}</p>
            <p>Updated at {new Date(profile.updatedAt).toISOString()}</p>
          </PageSection>
          {/* <PageSection>
            <Avatar
              url={avatar_url}
              size={150}
              onUpload={(url) => {
                setAvatarUrl(url)
                updateProfile({ username, website, avatar_url: url })
              }}
            />
          </PageSection> */}
          <PageSection>
            <button
              onClick={async () => {
                await fetch(`/api/profiles/${profile.userId}`, {
                  method: 'PUT',
                  body: JSON.stringify({ profileId: profile.userId }),
                })
              }}
            >
              Update
            </button>
            {/* <p>Username {user.)}</p> */}
            {/* <p>User ID {profile.id}</p>
          <p>AUD {JSON.stringify(profile.aud)}</p>
          <p>Mail {profile.email}</p>
        <p>Meta {JSON.stringify(profile.user_metadata)}</p> */}
          </PageSection>

          <div>
            <button onClick={() => signOut()}>Sign Out</button>
          </div>
        </>
      )}
    </Page>
  )
}
