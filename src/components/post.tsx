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
      author: {
        id: string
        username: string
        hasAvatar: boolean
      }
      tags: { id: string; title: string }[]
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
    <Link to={`/post/${post.id}`}>
      <Box smallPadding>
        <div className="w-full text-center">
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

          <div className="text-center flex">
            <div className="w-1/3">
              <TagsList tags={post.tags} />
            </div>

            <div className="w-2/3 leading-none flex justify-end space-x-4">
              <Link to={`user/${post.author.id}`}>
                <div className="flex flex-row p-4 rounded-lg items-center space-x-4 hover:bg-lime-200">
                  <span>{post.author.username}</span>
                  <Avatar
                    hasUserAvatar={post.author.hasAvatar ?? false}
                    size="small"
                    userId={post.author.id}
                  />
                </div>
              </Link>
              <Views>1.2K</Views>
              <Comments>6</Comments>
              <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                {post.updatedAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Box>
    </Link>
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
            <Views>1.2K</Views>
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
