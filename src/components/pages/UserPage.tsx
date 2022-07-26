import { UserPageProps } from '../../pages/user/[userId]'
import { Page, PageSection } from '../Page'
import { Avatar } from '../Avatar'
import { Box } from '../Box'
import { useUser } from '../../data/use-user'
import { PostsList } from '../post'
import { StatisticsCard } from '../StatisticsCard'
import { useUserPosts } from '../../data/use-user-posts'
import { UserDonations } from '../donation'

type QueryReturn = ReturnType<typeof useUser>
// exclude null, because the page will return "notFound" if user is null
type UserUserPage = Exclude<QueryReturn['user'], null>

type QueryReturnPosts = ReturnType<typeof useUserPosts>
type UserPostsUserPage = QueryReturnPosts['posts']

export function UserPage(props: UserPageProps): JSX.Element {
  const { user } = useUser(props.userId)
  const { posts } = useUserPosts(props.userId)

  return !user ? (
    <p>no user</p>
  ) : (
    <UserPageInternal
      user={user}
      userId={props.userId}
      posts={posts}
      userStatistics={props.userStatistics}
    />
  )
}

function UserPageInternal({
  user,
  userId,
  posts,
  userStatistics,
}: UserPageProps & {
  user: UserUserPage
  posts: UserPostsUserPage
}): JSX.Element {
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
                username={user.username}
                imageId={user.imageId}
                imageBlurDataURL={user.imageBlurDataURL}
                size="large"
              />
            </div>
          </div>
        </Box>
      </PageSection>

      <PageSection label="Statistics">
        <div className="flex flex-row space-x-10">
          <StatisticsCard
            label="Posts created"
            no={userStatistics.noOfPostsCreated}
          />
          <StatisticsCard
            label="Comments written"
            no={userStatistics.noOfCommentsWritten}
          />
          <StatisticsCard
            label="Views received"
            no={userStatistics.noOfViewsReceived}
          />
          <StatisticsCard
            label="Likes received"
            no={userStatistics.noOfLikesReceived}
          />
        </div>
      </PageSection>

      <PageSection label="Donation links">
        <div className="mx-auto w-full md:w-1/2 lg:w-1/3">
          <UserDonations
            isEditMode={true}
            userId={userId}
            userDonations={user.donationLinks.map((donationLink) => ({
              donationLinkId: donationLink.donationLinkId,
              donationProviderId: donationLink.donationProviderId,
              donationProviderName: donationLink.donationProvider.name,
              donationAddress: donationLink.address,
              logoId: donationLink.donationProvider.logoId,
            }))}
          />
        </div>
      </PageSection>

      <PageSection label="Posts">
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
                    imageBlurDataURL: post.author.imageBlurDataURL,
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
                  username={user.username}
                  imageId={user.imageId}
                  imageBlurDataURL={user.imageBlurDataURL}
                  size="small"
                />
              </div>
              <p>Small</p>
            </div>
            <div className="col-start-2">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  username={user.username}
                  imageId={user.imageId}
                  imageBlurDataURL={user.imageBlurDataURL}
                  size="medium"
                />
              </div>
              <p>Medium</p>
            </div>
            <div className="col-start-3">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  username={user.username}
                  imageId={user.imageId}
                  imageBlurDataURL={user.imageBlurDataURL}
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
