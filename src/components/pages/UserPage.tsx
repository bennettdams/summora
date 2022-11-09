import { useUserPosts } from '../../data/use-user-posts'
import { UserPageProps } from '../../pages/user/[userId]'
import { useAuth } from '../../services/auth-service'
import { trpc } from '../../util/trpc'
import { Avatar } from '../Avatar'
import { Box } from '../Box'
import { ButtonRemove } from '../Button'
import { DateTime } from '../DateTime'
import { UserDonations } from '../donation'
import { LoadingAnimation } from '../LoadingAnimation'
import { NoContent } from '../NoContent'
import { Page, PageSection } from '../Page'
import { PostsList } from '../post'
import { StatisticsCard } from '../StatisticsCard'

export function UserPage(props: UserPageProps): JSX.Element {
  const {
    data: user,
    isLoading,
    isError,
  } = trpc.user.byUserId.useQuery(
    { userId: props.userId },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )

  return (
    <Page>
      {isLoading ? (
        <LoadingAnimation />
      ) : isError ? (
        <p>Error loading user.</p>
      ) : !user ? (
        <NoContent>No user</NoContent>
      ) : (
        <UserPageInternal
          {...user}
          userId={props.userId}
          userStatistics={props.userStatistics}
        />
      )}
    </Page>
  )
}

function UserPageInternal({
  userId,
  username,
  createdAt,
  updatedAt,
  imageId,
  imageBlurDataURL,
  userStatistics,
}: UserPageProps & {
  userId: string
  username: string
  createdAt: Date
  updatedAt: Date
  imageId: string | null
  imageBlurDataURL: string | null
}): JSX.Element {
  const { posts, isLoading: isLoadingPosts } = useUserPosts(userId)
  const utils = trpc.useContext()
  const { data: donationLinks } = trpc.donationLink.byUserId.useQuery({
    userId,
  })
  const deleteAvatar = trpc.user.removeAvatar.useMutation({
    onSuccess: () => utils.user.byUserId.invalidate({ userId }),
  })
  const { userId: userIdAuth } = useAuth()

  return (
    <>
      <PageSection>
        <Box>
          <div className="flex">
            <div className="grow">
              <h2 className="text-3xl">{username}</h2>
              <p className="mt-8">User ID {userId}</p>
              <p>
                <span>Member since</span>
                <span className="ml-2 text-lg">
                  <DateTime format="MM-DD hh:mm" date={createdAt} />
                </span>
              </p>
              <p>
                <span>Last update</span>
                <span className="ml-2 text-lg">
                  <DateTime format="MM-DD hh:mm" date={updatedAt} />
                </span>
              </p>
            </div>

            <div className="mr-4 grid place-items-center">
              {!!imageId && (
                <ButtonRemove
                  onClick={() => deleteAvatar.mutate({ userId, imageId })}
                >
                  Delete avatar
                </ButtonRemove>
              )}
            </div>

            <div>
              <Avatar
                isEditable
                userId={userId}
                username={username}
                imageId={imageId}
                imageBlurDataURL={imageBlurDataURL}
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
        <div className="mx-auto w-full md:px-10 lg:px-20">
          <UserDonations
            isEditMode={userId === userIdAuth}
            userId={userId}
            userDonations={
              !donationLinks
                ? []
                : donationLinks.map((donationLink) => ({
                    donationLinkId: donationLink.donationLinkId,
                    donationProviderId:
                      donationLink.donationProvider.donationProviderId,
                    donationProviderName: donationLink.donationProvider.name,
                    donationAddress: donationLink.address,
                  }))
            }
          />
        </div>
      </PageSection>

      <PageSection>
        <Box>
          <h1 className="text-lg">Preview your avatar</h1>

          <div className="grid auto-rows-min grid-cols-3 text-center">
            <div className="col-start-1">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  username={username}
                  imageId={imageId}
                  imageBlurDataURL={imageBlurDataURL}
                  size="small"
                />
              </div>
              <p>Small</p>
            </div>
            <div className="col-start-2">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  username={username}
                  imageId={imageId}
                  imageBlurDataURL={imageBlurDataURL}
                  size="medium"
                />
              </div>
              <p>Medium</p>
            </div>
            <div className="col-start-3">
              <div className="grid h-full place-items-center">
                <Avatar
                  userId={userId}
                  username={username}
                  imageId={imageId}
                  imageBlurDataURL={imageBlurDataURL}
                  size="large"
                />
              </div>
              <p>Large</p>
            </div>
          </div>
        </Box>
      </PageSection>

      <PageSection label="Posts">
        {isLoadingPosts ? (
          <LoadingAnimation />
        ) : (
          <PostsList
            posts={posts.map((post) => ({
              id: post.id,
              categoryTitle: post.category.name,
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
              noOfComments: post._count.comments,
            }))}
          />
        )}
      </PageSection>
    </>
  )
}
