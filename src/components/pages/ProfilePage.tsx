import { ProfilePageProps } from '../../pages/profile/[profileId]'
import { useAuth } from '../../services/auth-service'
import { Page, PageSection } from '../Page'
// import { Avatar } from '../Avatar'

export function ProfilePage({ user }: ProfilePageProps): JSX.Element {
  const { signOut } = useAuth()
  return (
    <Page>
      {!user ? (
        <p>Not signed in</p>
      ) : (
        <>
          <PageSection>
            <p>Email {user.email}</p>
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
          <p>a {JSON.stringify(user.aud)}</p>
          <p>a {user.email}</p>
          <p>a {user.id}</p>
          <p>a {JSON.stringify(user.user_metadata)}</p>

          <div>
            <button onClick={() => signOut()}>Sign Out</button>
          </div>
        </>
      )}
    </Page>
  )
}
