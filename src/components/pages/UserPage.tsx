import { UserPageProps } from '../../pages/user/[userId]'
import { Page, PageSection } from '../Page'
import { Avatar } from '../Avatar'
import { Box } from '../Box'
import { useUser } from '../../data/use-user'
import { PostsList } from '../post'

type QueryReturn = ReturnType<typeof useUser>
// exclude null, because the page will return "notFound" if user is null
type UserUserPage = Exclude<QueryReturn['user'], null>

export function UserPage(props: UserPageProps): JSX.Element {
  const { user } = useUser(props.userId)
  return !user ? (
    <p>no user</p>
  ) : (
    <UserPageInternal user={user} userId={props.userId} posts={props.posts} />
  )
}

function UserPageInternal({
  user,
  userId,
  posts,
}: UserPageProps & { user: UserUserPage }): JSX.Element {
  return (
    <Page>
      <PageSection>
        <Box>
          <div className="flex">
            <div className="grow">
              <h2 className="text-3xl">{user.username}</h2>
              <p className="mt-8">User ID {userId}</p>
              <p>
                <span>Member since</span>
                <span className="ml-2 text-lg">
                  {new Date(user.createdAt).toISOString()}
                </span>
              </p>
              <p>
                <span>Last update</span>
                <span className="ml-2 text-lg">
                  {new Date(user.updatedAt).toISOString()}
                </span>
              </p>
            </div>
            <div>
              <Avatar
                isEditable
                userId={userId}
                imageId={user.imageId ?? null}
                size="large"
              />
            </div>
          </div>
        </Box>
      </PageSection>

      <PageSection title="Posts">
        <PostsList
          posts={
            !posts
              ? null
              : posts.map((post) => ({
                  id: post.id,
                  categoryTitle: post.category.title,
                  title: post.title,
                  subtitle: post.subtitle,
                  updatedAt: post.updatedAt,
                  author: {
                    id: post.authorId,
                    username: post.author.username,
                    imageId: post.author.imageId,
                  },
                  noOfViews: post.noOfViews,
                  noOfComments: post._count?.comments ?? 0,
                  noOfLikes: post.noOfLikes,
                  likedBy: post.likedBy,
                  segments: post.segments,
                  tags: post.tags,
                }))
          }
        />
      </PageSection>

      <PageSection>
        <Box>
          <h1 className="text-lg">Preview your avatar</h1>

          <div className="grid auto-rows-min grid-cols-3 text-center">
            <div className="col-start-1">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  imageId={user.imageId ?? null}
                  size="small"
                />
              </div>
              <p>Small</p>
            </div>
            <div className="col-start-2">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  imageId={user.imageId ?? null}
                  size="medium"
                />
              </div>
              <p>Medium</p>
            </div>
            <div className="col-start-3">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  imageId={user.imageId ?? null}
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
