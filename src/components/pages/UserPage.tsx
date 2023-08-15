import { useRef, useState } from 'react'
import { AppMessage } from '../../lib/app-messages'
import { schemaEditUsername } from '../../lib/schemas'
import { UserPageProps } from '../../pages/user/[userId]'
import { useAuth } from '../../services/auth-service'
import { trpc } from '../../util/trpc'
import { useOnClickOutside } from '../../util/use-on-click-outside'
import { useZodForm } from '../../util/use-zod-form'
import { Avatar } from '../Avatar'
import { Box } from '../Box'
import { ButtonRemove } from '../Button'
import { DateTime } from '../DateTime'
import { EditOverlay } from '../EditOverlay'
import { LoadingAnimation } from '../LoadingAnimation'
import { Page, PageSection } from '../Page'
import { StatisticsCard } from '../StatisticsCard'
import { UserDonations } from '../donation'
import { Form, Input, useIsSubmitEnabled } from '../form'
import { PostsList } from '../post-reusable'
import { NoContent } from '../typography'

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
    },
  )

  return (
    <Page>
      {isLoading ? (
        <LoadingAnimation />
      ) : isError ? (
        <p>Error loading user.</p>
      ) : !user ? (
        <NoContent>No user.</NoContent>
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
  imageFileExtension,
  userStatistics,
}: UserPageProps & {
  userId: string
  username: string
  createdAt: Date
  updatedAt: Date
  imageId: string | null
  imageBlurDataURL: string | null
  imageFileExtension: string | null
}): JSX.Element {
  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
  } = trpc.posts.someByUserId.useQuery({ userId })
  const utils = trpc.useContext()
  const {
    data: donationLinks,
    isLoading: isLoadingDonationLinks,
    isError: isErrorDonationLinks,
  } = trpc.donationLink.byUserId.useQuery({
    userId,
  })
  const deleteAvatar = trpc.user.removeAvatar.useMutation({
    onSuccess: () => utils.user.byUserId.invalidate({ userId }),
  })
  const editUsername = trpc.user.editUsername.useMutation({
    onSuccess: () => {
      utils.posts.invalidate()
      utils.postComments.invalidate()
      utils.user.invalidate()
    },
  })
  const { userIdAuth } = useAuth()
  const isOwnUser = userId === userIdAuth

  const [hasUsernameError, setHasUsernameError] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const refUsername = useRef<HTMLDivElement>(null)
  useOnClickOutside(refUsername, () => {
    if (!hasUsernameError) {
      setIsEditMode(false)
    }
  })

  const {
    handleSubmit,
    register,
    control,
    formState: {
      errors: { username: usernameError },
    },
    setError,
    clearErrors,
  } = useZodForm({
    schema: schemaEditUsername,
    values: {
      userId,
      username,
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    isLoading: editUsername.isLoading,
    control,
  })

  return (
    <>
      <PageSection>
        <div className="flex flex-col p-2 lg:flex-row lg:p-10">
          <div className="lg:w-1/4"></div>

          <div className="w-full lg:w-2/4">
            <EditOverlay
              isEnabled={userId === userIdAuth && !isEditMode}
              onClick={() => setIsEditMode(true)}
            >
              <h2
                className={`truncate p-2 text-center font-serif text-5xl text-dprimary ${
                  isEditMode ? 'hidden' : 'block'
                }`}
              >
                {username}
              </h2>

              <div
                ref={refUsername}
                className={`${isEditMode ? 'block' : 'hidden'}`}
              >
                <Form
                  onBlur={handleSubmit(async (data) => {
                    // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
                    if (isSubmitEnabled) {
                      const result = await editUsername.mutateAsync({
                        userId,
                        username: data.username,
                      })

                      const errorExpected: AppMessage = 'errorUniqueUsername'

                      if (result === errorExpected) {
                        // the outside click will hide the edit mode, so we re-enable it
                        if (!isEditMode) {
                          setIsEditMode(true)
                        }
                        setHasUsernameError(true)
                        setError('username', {
                          message:
                            'The username is already taken, please try another one.',
                        })
                      } else {
                        setIsEditMode(false)
                        setHasUsernameError(false)
                        clearErrors('username')
                      }
                    }
                  })}
                >
                  <Input
                    {...register('username')}
                    placeholder="Enter a username.."
                    validationErrorMessage={usernameError?.message}
                    isSpecial
                    isLoading={editUsername.isLoading}
                    blurOnEnterPressed
                  />
                </Form>
              </div>
            </EditOverlay>

            <div className="mt-6 text-center">
              <p className="uppercase tracking-widest">Member since</p>
              <p className="text-lg font-semibold">
                <DateTime
                  format="MM-DD hh:mm"
                  title="Member since"
                  date={createdAt}
                />
              </p>
              <p className="uppercase tracking-widest">Last update</p>
              <p className="text-lg font-semibold">
                <DateTime
                  format="MM-DD hh:mm"
                  title="Last update"
                  date={updatedAt}
                />
              </p>
            </div>
          </div>

          <div className="mt-4 grid place-items-center lg:mt-0 lg:w-1/4">
            {/* `w-min` to prvent the hover color not spreading to the width of the container */}
            <div className="w-min">
              <Avatar
                isEditable={isOwnUser}
                userId={userId}
                username={username}
                imageId={imageId}
                imageBlurDataURL={imageBlurDataURL}
                imageFileExtension={imageFileExtension}
                size="large"
              />
            </div>

            <div className="mt-2 grid place-items-center">
              {isOwnUser && !!imageId && (
                <ButtonRemove onClick={() => deleteAvatar.mutate()}>
                  Delete avatar
                </ButtonRemove>
              )}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-2 gap-4 lg:mx-32 lg:grid-cols-4">
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
        <div className="w-full md:px-10 lg:px-20">
          {isLoadingDonationLinks ? (
            <div className="grid w-full place-items-center">
              <LoadingAnimation />
            </div>
          ) : isErrorDonationLinks || !donationLinks ? (
            <NoContent>Error receiving donation links.</NoContent>
          ) : (
            <UserDonations
              isEditMode={userId === userIdAuth}
              userId={userId}
              username={username}
              userDonations={donationLinks.map((donationLink) => ({
                donationLinkId: donationLink.donationLinkId,
                donationProviderId:
                  donationLink.donationProvider.donationProviderId,
                donationProviderName: donationLink.donationProvider.name,
                donationAddress: donationLink.address,
              }))}
            />
          )}
        </div>
      </PageSection>

      {isOwnUser && (
        <PageSection label="Avatar preview">
          <Box>
            <div className="grid grid-cols-2 gap-10 p-10 text-center lg:grid-cols-3">
              <div className="col-start-1 row-start-1 grid place-items-center lg:col-auto">
                <Avatar
                  userId={userId}
                  username={username}
                  imageId={imageId}
                  imageBlurDataURL={imageBlurDataURL}
                  imageFileExtension={imageFileExtension}
                  size="small"
                />
              </div>
              <div className="col-start-1 row-start-2 lg:col-auto">
                <p>Small</p>
              </div>

              <div className="col-start-2 row-start-1 grid place-items-center lg:col-auto">
                <Avatar
                  userId={userId}
                  username={username}
                  imageId={imageId}
                  imageBlurDataURL={imageBlurDataURL}
                  imageFileExtension={imageFileExtension}
                  size="medium"
                />
              </div>
              <div className="col-start-2 row-start-2 lg:col-auto">
                <p>Medium</p>
              </div>

              <div className="col-span-2 row-start-3 grid place-items-center lg:col-span-1 lg:row-start-1">
                <Avatar
                  userId={userId}
                  username={username}
                  imageId={imageId}
                  imageBlurDataURL={imageBlurDataURL}
                  imageFileExtension={imageFileExtension}
                  size="large"
                />
              </div>
              <div className="col-span-2 row-start-4 lg:col-span-1 lg:row-start-2">
                <p>Large</p>
              </div>
            </div>
          </Box>
        </PageSection>
      )}

      <PageSection label={`Posts by ${username}`}>
        {isLoadingPosts ? (
          <LoadingAnimation />
        ) : isErrorPosts || !posts ? (
          <NoContent>Error loading posts.</NoContent>
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
                imageFileExtension: post.author.imageFileExtension,
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
