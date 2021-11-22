import { useState } from 'react'
import { Link } from './Link'
import { Views } from './Likes'
import { Comments } from './Comments'
import { Box } from './Box'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { TagsList } from './tag'

type PostsPostsList =
  | null
  | {
      id: string
      title: string
      subtitle: string | null
      categoryTitle: string
      segments: { id: string; title: string }[]
      updatedAt: Date
      views: number
      author: {
        id: string
        username: string
        hasAvatar: boolean
      }
      tags: { id: string; title: string }[]
      noOfComments: number
    }[]

type PostPostsList = NonNullable<PostsPostsList>[number]

export function PostsList({ posts }: { posts: PostsPostsList }): JSX.Element {
  const [showLongPost, setShowLongPost] = useState(true)

  return (
    <div>
      <Button onClick={() => setShowLongPost(true)}>long</Button>
      <Button onClick={() => setShowLongPost(false)}>short</Button>

      {!posts ? (
        <div>no posts :(</div>
      ) : posts.length === 0 ? (
        <div>This user has not created a post yet.</div>
      ) : showLongPost ? (
        <div className="mt-10 flex flex-col space-y-10">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
          {posts.map((post) => (
            <PostItemShort key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function PostItem({ post }: { post: PostPostsList }): JSX.Element {
  return (
    <Box smallPadding>
      <div className="w-full text-center">
        <Link to={`/post/${post.id}`}>
          <h2 className="tracking-widest text-xs font-medium text-gray-400">
            {post.categoryTitle}
          </h2>
          <h1 className="mt-1 sm:text-2xl text-xl font-medium">{post.title}</h1>
          <p className="mt-3 leading-relaxed">{post.subtitle}</p>

          <div className="flex my-4 py-4 flex-row flex-nowrap overflow-y-hidden space-x-4">
            {post.segments.map((segment) => {
              return (
                <div
                  key={segment.id}
                  className="flex-none grid place-items-center w-60 h-32 bg-blue-100 rounded-lg"
                >
                  {segment.title}
                </div>
              )
            })}
          </div>
        </Link>

        <div className="text-center h-14 flex">
          <div className="w-1/2 overflow-y-hidden">
            <TagsList tags={post.tags} />
          </div>

          <div className="w-1/2 h-full leading-none flex justify-end space-x-4">
            <div className="w-1/2 h-full flex flex-col">
              <div className="flex-1 space-x-5">
                <Views>{post.views}</Views>
                <Comments>{post.noOfComments}</Comments>
              </div>
              <div className="flex-1">
                <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                  {post.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="w-1/2 h-full">
              <div className="flex h-full justify-end">
                <Link to={`user/${post.author.id}`}>
                  <div className="flex h-full items-center space-x-4 px-4 rounded-lg hover:bg-lime-200">
                    <span>{post.author.username}</span>
                    <Avatar
                      hasUserAvatar={post.author.hasAvatar ?? false}
                      size="small"
                      userId={post.author.id}
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

function PostItemShort({ post }: { post: PostPostsList }): JSX.Element {
  return (
    <Link to={`/post/${post.id}`}>
      <Box smallPadding>
        <div className="w-full h-60 text-center relative">
          <h2 className="tracking-widest text-xs font-medium text-gray-400">
            {post.categoryTitle}
          </h2>
          <h1 className="mt-1 sm:text-2xl text-xl font-medium">{post.title}</h1>
          <p className="mt-3 leading-relaxed">{post.subtitle}</p>
          <div className="text-center mt-2 leading-none flex justify-center absolute bottom-0 w-full py-3 space-x-4">
            <Views>{post.views}</Views>
            <Comments>6</Comments>
            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
              {post.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </Box>
    </Link>
  )
}

/**
 * Creates a comment tree from a flat array.
 * For root level comments, use "null" as "commentId".
 *
 * input:
 * [1 | 1.1 | 2 | 3 | 3.1 | 3.2]
 *
 * output:
 * [1 [1.1] | 2 | 3 [3.1, 3.2] ]
 */
function createCommentTree(
  comments: PostCommentTreeComment[],
  commentId: string | null
): PostCommentTreeComment[] {
  return comments
    .filter((comment) => comment.commentParentId === commentId)
    .map((comment) => ({
      ...comment,
      commentChilds: createCommentTree(comments, comment.commentId),
    }))
}

type PostComment = {
  commentId: string
  commentParentId: string | null
  text: string
}

type PostCommentTreeComment = PostComment & {
  commentChilds: PostCommentTreeComment[]
}

function Comment({
  comment,
  isRoot = false,
}: {
  comment: PostCommentTreeComment
  isRoot: boolean
}) {
  return (
    <div className={`space-y-2 ${isRoot ? 'bg-lime-100' : 'ml-10'}`}>
      <div>{comment.text}</div>

      {comment.commentChilds.map((comment) => (
        <Comment key={comment.commentId} isRoot={false} comment={comment} />
      ))}
    </div>
  )
}

export function PostComments({
  comments,
}: {
  comments: PostComment[]
}): JSX.Element {
  const [commentsForTree] = useState<PostCommentTreeComment[]>(
    comments.map((comm) => ({ ...comm, commentChilds: [] }))
  )
  return (
    <div className="w-full space-y-10">
      {/* For the root level tree, we use "true" as comment ID. See "createCommentTree" docs. */}
      {createCommentTree(commentsForTree, null).map((comm) => (
        <Comment key={comm.commentId} isRoot={true} comment={comm} />
      ))}
    </div>
  )
}
