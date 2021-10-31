import { UserPageProps } from '../../pages/user/[userId]'
import { Page, PageSection } from '../Page'
import { Avatar } from '../Avatar'
import { Box } from '../Box'

export function UserPage({ user }: UserPageProps): JSX.Element {
  return (
    <Page>
      {!user ? (
        <p>User does not exist.</p>
      ) : (
        <>
          <PageSection>
            <Box>
              <p>USER</p>
              <div className="flex">
                <div className="flex-grow">
                  <p>User ID {user.userId}</p>
                  <p>Username {user.username}</p>
                  <p>Created at {new Date(user.createdAt).toISOString()}</p>
                  <p>Updated at {new Date(user.updatedAt).toISOString()}</p>
                </div>
                <div>
                  <Avatar isEditable userId={user.userId} size="large" />
                </div>
              </div>
            </Box>
          </PageSection>

          <PageSection>
            <Box>
              <h1 className="text-lg">Preview your avatar</h1>

              <div className="grid auto-rows-min grid-cols-3 text-center">
                <div className="col-start-1">
                  <div className="h-full grid place-items-center">
                    <Avatar userId={user.userId} size="small" />
                  </div>
                  <p>Small</p>
                </div>
                <div className="col-start-2">
                  <div className="h-full grid place-items-center">
                    <Avatar userId={user.userId} size="medium" />
                  </div>
                  <p>Medium</p>
                </div>
                <div className="col-start-3">
                  <div className="h-full grid place-items-center">
                    <Avatar userId={user.userId} size="large" />
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
