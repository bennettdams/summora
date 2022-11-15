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
  const { userIdAuth } = useAuth()
  const isOwnUser = userId === userIdAuth

  return (
    <>
      <PageSection>
        <div className="flex p-10">
          <div className="w-1/4"></div>

          <div className="w-2/4">
            <h2 className="text-center text-5xl text-dlila">{username}</h2>

            <div className="mt-6 text-center">
              <p className="uppercase tracking-widest">Member since</p>
              <p className="text-lg font-semibold">
                <DateTime format="MM-DD hh:mm" date={createdAt} />
              </p>
              <p className="uppercase tracking-widest">Last update</p>
              <p className="text-lg font-semibold">
                <DateTime format="MM-DD hh:mm" date={updatedAt} />
              </p>
            </div>
          </div>

          <div className="w-1/4">
            <div>
              <Avatar
                isEditable={isOwnUser}
                userId={userId}
                username={username}
                imageId={imageId}
                imageBlurDataURL={imageBlurDataURL}
                size="large"
              />
            </div>

            <div className="grid place-items-center">
              {isOwnUser && !!imageId && (
                <ButtonRemove
                  onClick={() => deleteAvatar.mutate({ userId, imageId })}
                >
                  Delete avatar
                </ButtonRemove>
              )}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
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

      {isOwnUser && (
        <PageSection label="Avatar preview">
          <Box>
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
      )}

      <PageSection label={`Posts by ${username}`}>
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
