import { UserPageProps } from '../../pages/user/[userId]'
import { Page, PageSection } from '../Page'
import { Avatar } from '../Avatar'
import { Box } from '../Box'
import { useUser } from '../../data/use-user'

type QueryReturn = ReturnType<typeof useUser>
// exclude null, because the page will return "notFound" if post is null
type UserUserPage = Exclude<QueryReturn['user'], null>

export function UserPage(props: UserPageProps): JSX.Element {
  const { user } = useUser(props.userId)
  return !user ? (
    <p>no user</p>
  ) : (
    <UserPageInternal user={user} userId={props.userId} />
  )
}

function UserPageInternal({
  user,
  userId,
}: UserPageProps & { user: UserUserPage }): JSX.Element {
  return (
    <Page>
      <PageSection>
        <Box>
          <p>USER</p>
          <div className="flex">
            <div className="flex-grow">
              <p>User ID {userId}</p>
              <p>Username {user.username}</p>
              <p>Created at {new Date(user.createdAt).toISOString()}</p>
              <p>Updated at {new Date(user.updatedAt).toISOString()}</p>
            </div>
            <div>
              <Avatar
                hasUserAvatar={user.hasAvatar ?? false}
                isEditable
                userId={userId}
                size="large"
              />
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
                <Avatar
                  hasUserAvatar={user.hasAvatar ?? false}
                  userId={userId}
                  size="small"
                />
              </div>
              <p>Small</p>
            </div>
            <div className="col-start-2">
              <div className="h-full grid place-items-center">
                <Avatar
                  hasUserAvatar={user.hasAvatar ?? false}
                  userId={userId}
                  size="medium"
                />
              </div>
              <p>Medium</p>
            </div>
            <div className="col-start-3">
              <div className="h-full grid place-items-center">
                <Avatar
                  hasUserAvatar={user.hasAvatar ?? false}
                  userId={userId}
                  size="large"
                />
              </div>
              <p>Large</p>
            </div>
          </div>
        </Box>
      </PageSection>
    </Page>
  )
}
