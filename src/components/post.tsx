import { useState } from 'react'
import { Link } from './link'
import { ViewsIcon } from './ViewsIcon'
import { CommentsIcon } from './CommentsIcon'
import { Box } from './Box'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { TagsList } from './tag'
import { usePost } from '../data/use-post'
import { useAuth } from '../services/auth-service'
import { LikesIcon } from './LikesIcon'
import { IconSize } from './Icon'
import { useHasMounted } from '../util/use-has-mounted'
import { ROUTES } from '../services/routing'
import { NoContent } from './NoContent'

type PostsPostsList =
  | null
  | {
      id: string
      title: string
      subtitle: string | null
      categoryTitle: string
      segments: { id: string; title: string }[]
      updatedAt: Date
      noOfViews: number
      noOfComments: number
      noOfLikes: number
      likedBy: { userId: string }[]
      author: {
        id: string
        username: string
        imageId: string | null
        imageBlurDataURL: string | null
      }
      tags: { id: string; title: string }[]
    }[]

type PostPostsList = NonNullable<PostsPostsList>[number]

export function PostsList({ posts }: { posts: PostsPostsList }): JSX.Element {
  const [showLongPost, setShowLongPost] = useState(true)
  const { userId } = useAuth()

  return (
    <div>
      <Button onClick={() => setShowLongPost(true)}>long</Button>
      <Button onClick={() => setShowLongPost(false)}>short</Button>

      {!posts ? (
        <div>Error while getting posts :(</div>
      ) : posts.length === 0 ? (
        <div>No posts yet.</div>
      ) : showLongPost ? (
        <div className="mt-10 grid w-full grid-cols-1 gap-20 xl:grid-cols-2">
          {posts.map((post) => (
            <PostsListItem key={post.id} post={post} userId={userId} />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
          {posts.map((post) => (
            <PostsListItemShort key={post.id} post={post} userId={userId} />
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
  return (
    <Box padding="small" shadow="xxl">
      <div className="text-center">
        <Link to={ROUTES.post(post.id)}>
          <div className="relative">
            <div className="absolute top-0 left-0 inline">
              <PostLikes
                postId={post.id}
                userId={userId}
                postLikedByUserIds={post.likedBy}
                noOfLikes={post.noOfLikes}
                iconSize="big"
              />
            </div>
            <h2 className="text-xs font-semibold tracking-widest text-dorange">
              {post.categoryTitle}
            </h2>
            <h1 className="mt-1 text-xl font-semibold text-dlila sm:text-2xl">
              {post.title}
            </h1>
            <p className="mt-3 leading-relaxed text-dorange">{post.subtitle}</p>

            <div className="my-4 flex snap-x flex-row flex-nowrap space-x-4 overflow-y-hidden py-4">
              {post.segments.length === 0 ? (
                <NoContent>No segments yet</NoContent>
              ) : (
                post.segments.map((segment) => {
                  return (
                    <div
                      key={segment.id}
                      className="grid h-32 w-60 flex-none snap-start place-items-center rounded-lg bg-dlight"
                    >
                      <p className="p-5">{segment.title}</p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Link>

        <div className="flex h-14 text-center">
          <div className="w-1/2 overflow-y-hidden">
            <TagsList tags={post.tags} />
          </div>

          <div className="flex h-full w-1/2 justify-end space-x-4 leading-none">
            <div className="flex h-full w-1/2 flex-col">
              <div className="flex-1 space-x-5">
                <ViewsIcon noOfViews={post.noOfViews} />
                <CommentsIcon noOfComments={post.noOfComments} />
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center text-sm">
                  {post.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="h-full w-1/2">
              <div className="flex h-full justify-end">
                <Link to={ROUTES.user(post.author.id)}>
                  <div className="flex h-full items-center space-x-4 rounded-lg px-4 hover:bg-dbrown hover:text-white">
                    <span>{post.author.username}</span>
                    <Avatar
                      userId={post.author.id}
                      username={post.author.username}
                      imageId={post.author.imageId}
                      imageBlurDataURL={post.author.imageBlurDataURL}
                      size="small"
                    />
                  </div>
                </Link>
              </div>
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
      <Box padding="small">
        <div className="relative h-60 w-full text-center">
          <h2 className="text-xs font-semibold tracking-widest text-dorange">
            {post.categoryTitle}
          </h2>
          <h1 className="mt-1 text-xl font-semibold text-dlila sm:text-2xl">
            {post.title}
          </h1>
          <p className="mt-3 leading-relaxed text-dbrown">{post.subtitle}</p>
          <div className="absolute bottom-0 mt-2 flex w-full justify-center space-x-4 py-3 text-center leading-none">
            <PostLikes
              postId={post.id}
              userId={userId}
              postLikedByUserIds={post.likedBy}
              noOfLikes={post.noOfLikes}
            />
            <ViewsIcon noOfViews={post.noOfViews} />
            <CommentsIcon noOfComments={post.noOfComments} />
            <span className="inline-flex items-center text-sm leading-none">
              {post.updatedAt.toLocaleDateString()}
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
  postLikedByUserIds,
  noOfLikes,
  isLikeUnlikeEnabled = true,
  iconSize = 'medium',
}: {
  postId: string
  userId: string | null
  postLikedByUserIds: { userId: string }[]
  noOfLikes: number
  /**
   * e.g. use for a list of posts, where we want to show a "liked" icon all the time
   */
  isLikeUnlikeEnabled?: boolean
  iconSize?: IconSize
}): JSX.Element {
  const { likeUnlikePost } = usePost(postId, false)

  const isLiked = !isLikeUnlikeEnabled
    ? true
    : !userId
    ? false
    : postLikedByUserIds.some(
        (userLikesPost) => userLikesPost.userId === userId
      )

  /**
   * We need to wait for the component to mount on the client before rendering the likes.
   * That's because we can only determine whether the post is liked by a user when we have the auth cookie at hand.
   * Without this check, the server will render the "unliked" heart, because he never has
   * the user ID. After hydration at the client, the unliked heart is not replaced with the
   * liked heart, because no properties (e.g. noOfLikes) have changed (because we provide the
   * data via hydration/React Query), so even though a user liked a post, the unliked heart will be shown.
   */
  const hasMounted = useHasMounted()

  return (
    <div className="flex">
      {hasMounted && (
        <LikesIcon
          noOfLikes={noOfLikes}
          isLiked={isLiked}
          size={iconSize}
          onClick={async () =>
            !!isLikeUnlikeEnabled && (await likeUnlikePost(postId))
          }
        />
      )}
    </div>
  )
}
