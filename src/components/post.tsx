import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useAuth } from '../services/auth-service'
import { ROUTES } from '../services/routing'
import { trpc } from '../util/trpc'
import { useHasMounted } from '../util/use-has-mounted'
import { Avatar } from './Avatar'
import { Box } from './Box'
import { ChoiceSelect, useChoiceSelect } from './ChoiceSelect'
import { CommentsIcon } from './CommentsIcon'
import { DateTime } from './DateTime'
import { IconLong, IconShort, IconSize } from './Icon'
import { LikesIcon } from './LikesIcon'
import { Link } from './link'
import { LoadingAnimation } from './LoadingAnimation'
import { NoContent } from './NoContent'
import { TagsList } from './tag'
import { ViewsIcon } from './ViewsIcon'

type PostsPostsList =
  | null
  | {
      id: string
      title: string
      subtitle: string | null
      categoryTitle: string
      updatedAt: Date
      noOfViews: number
      noOfComments: number
      author: {
        id: string
        username: string
        imageId: string | null
        imageBlurDataURL: string | null
        imageFileExtension: string | null
      }
    }[]

type PostPostsList = NonNullable<PostsPostsList>[number]
type ViewVariant = 'short' | 'long'

export function PostsList({
  posts,
  initialViewVariant = 'long',
}: {
  posts: PostsPostsList
  initialViewVariant?: ViewVariant
}): JSX.Element {
  const { userIdAuth } = useAuth()

  const choiceSelectControl = useChoiceSelect(
    [
      {
        choiceId: 'long',
        label: 'Long',
        icon: <IconLong className="text-dtertiary" />,
      },
      {
        choiceId: 'short',
        label: 'Short',
        icon: <IconShort className="text-dtertiary" />,
      },
    ],
    initialViewVariant
  )

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  return (
    <div>
      <div className="w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
        <ChoiceSelect control={choiceSelectControl} />
      </div>

      {!posts || posts.length === 0 ? (
        <div
          ref={animateRef}
          className="mt-10 grid w-full grid-cols-1 gap-20 xl:grid-cols-2"
        >
          <NoContent>No posts.</NoContent>
        </div>
      ) : choiceSelectControl.selected.choiceId === 'long' ? (
        <div
          ref={animateRef}
          className="mt-10 grid w-full grid-cols-1 gap-20 xl:grid-cols-2"
        >
          {posts.map((post) => (
            <PostsListItem key={post.id} post={post} userId={userIdAuth} />
          ))}
        </div>
      ) : (
        <div
          ref={animateRef}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-12"
        >
          {posts.map((post) => (
            <PostsListItemShort key={post.id} post={post} userId={userIdAuth} />
          ))}
        </div>
      )}
    </div>
  )
}

function PostsListItem({
  post,
  userId,
}: {
  post: PostPostsList
  userId: string | null
}): JSX.Element {
  const { data: tags, isLoading: isLoadingTags } =
    trpc.postTags.byPostId.useQuery({
      postId: post.id,
    })
  const { data: segments, isLoading: isLoadingSegments } =
    trpc.postSegments.byPostId.useQuery({
      postId: post.id,
    })

  return (
    <Box padding="small" showShadow>
      <div className="text-center">
        <Link to={ROUTES.post(post.id)}>
          <div className="relative">
            <div className="absolute top-0 left-0 hidden lg:inline">
              <PostLikes postId={post.id} userId={userId} iconSize="big" />
            </div>
            <h2 className="text-xs font-semibold tracking-widest text-dsecondary">
              {post.categoryTitle}
            </h2>
            <h1 className="mt-1 font-serif text-2xl text-dprimary">
              {post.title}
            </h1>
            <p className="mt-3 leading-relaxed text-dsecondary">
              {post.subtitle}
            </p>

            <div className="my-4 flex h-28 snap-x flex-row flex-nowrap space-x-4 overflow-y-hidden">
              {isLoadingSegments ? (
                <LoadingAnimation />
              ) : !segments || segments.length === 0 ? (
                <NoContent>No segments yet.</NoContent>
              ) : (
                segments.map((segment) => {
                  return (
                    <div
                      key={segment.id}
                      className="grid h-20 w-60 flex-none snap-start place-items-center rounded-lg bg-dlight p-5"
                    >
                      <span className="block truncate whitespace-normal">
                        {segment.title}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Link>

        <div className="flex flex-col gap-4 text-center lg:flex-row">
          <div className="h-14 w-full overflow-y-hidden lg:w-1/2">
            {isLoadingTags ? (
              <LoadingAnimation />
            ) : (
              <TagsList tags={tags ?? null} />
            )}
          </div>

          <div className="flex h-full w-full justify-end space-x-4 leading-none lg:w-1/2">
            <div className="flex h-full w-1/2 flex-col space-y-2">
              <div className="flex flex-1 flex-row items-center justify-center space-x-5 text-center lg:space-x-2">
                <span className="inline-block lg:hidden">
                  <PostLikes
                    postId={post.id}
                    userId={userId}
                    iconSize="medium"
                  />
                </span>
                <ViewsIcon noOfViews={post.noOfViews} />
                <CommentsIcon noOfComments={post.noOfComments} />
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center text-sm">
                  <DateTime format="MM-DD hh:mm" date={post.updatedAt} />
                </span>
              </div>
            </div>

            <div className="flex h-full w-1/2 flex-col space-y-2">
              <Link to={ROUTES.user(post.author.id)}>
                <div className="flex h-full max-w-full items-center rounded-lg p-1.5 hover:bg-dsecondary hover:text-white">
                  <div className="w-2/3">
                    <p className="truncate text-right">
                      {post.author.username}
                    </p>
                  </div>
                  <div className="flex w-1/3 items-end justify-end">
                    <div>
                      <Avatar
                        userId={post.author.id}
                        username={post.author.username}
                        imageId={post.author.imageId}
                        imageBlurDataURL={post.author.imageBlurDataURL}
                        imageFileExtension={post.author.imageFileExtension}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

function PostsListItemShort({
  post,
  userId,
}: {
  post: PostPostsList
  userId: string | null
}): JSX.Element {
  return (
    <Link to={ROUTES.post(post.id)}>
      <Box padding="small" showShadow>
        <div className="relative h-48 w-full text-center">
          <h2 className="text-xs font-semibold tracking-widest text-dsecondary">
            {post.categoryTitle}
          </h2>
          <h1 className="mt-1 text-xl font-semibold text-dprimary sm:text-2xl">
            {post.title}
          </h1>
          <div className="absolute bottom-0 mt-2 flex w-full justify-center space-x-4 py-3 text-center leading-none">
            <PostLikes postId={post.id} userId={userId} />
            <ViewsIcon noOfViews={post.noOfViews} />
            <CommentsIcon noOfComments={post.noOfComments} />
            <span className="inline-flex items-center text-sm leading-none">
              <DateTime format="MM-DD hh:mm" date={post.updatedAt} />
            </span>
          </div>
        </div>
      </Box>
    </Link>
  )
}

export function PostLikes({
  postId,
  userId,
  isLikeUnlikeEnabled = true,
  iconSize = 'medium',
}: {
  postId: string
  userId: string | null
  /**
   * e.g. use for a list of posts, where we want to show a "liked" icon all the time
   */
  isLikeUnlikeEnabled?: boolean
  iconSize?: IconSize
}): JSX.Element {
  const utils = trpc.useContext()

  const { data: postLikedByUserIds, isLoading } =
    trpc.postLikes.byPostId.useQuery({
      postId,
    })

  const toggleLike = trpc.postLikes.toggleLike.useMutation({
    onSuccess: () => {
      utils.postLikes.byPostId.invalidate({ postId })
    },
  })

  /**
   * We need to wait for the component to mount on the client before rendering the likes.
   * That's because we can only determine whether the post is liked by a user when we have the auth cookie at hand.
   * Without this check, the server will render the "unliked" heart, because he never has
   * the user ID. After hydration at the client, the unliked heart is not replaced with the
   * liked heart, because no properties (e.g. noOfLikes) have changed (because we provide the
   * data via hydration/React Query), so even though a user liked a post, the unliked heart will be shown.
   */
  const hasMounted = useHasMounted()

  if (isLoading) return <LoadingAnimation size="small" />

  const isLiked = !isLikeUnlikeEnabled
    ? true
    : !userId
    ? false
    : !postLikedByUserIds
    ? false
    : postLikedByUserIds.some((userLikesPost) => userLikesPost.id === userId)

  return (
    <div className="flex">
      {hasMounted && (
        <LikesIcon
          noOfLikes={postLikedByUserIds?.length ?? 0}
          isLiked={isLiked}
          size={iconSize}
          onClick={async () =>
            !!isLikeUnlikeEnabled && toggleLike.mutate({ postId })
          }
        />
      )}
    </div>
  )
}
