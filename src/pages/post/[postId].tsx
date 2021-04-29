import ErrorPage from 'next/error'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Box } from '../../components/Box'
import { Button } from '../../components/Button'
import { FormInput } from '../../components/FormInput'
import { LoadingAnimation } from '../../components/LoadingAnimation'
import { Page, PageSection } from '../../components/Page'
import { usePost } from '../../data/post-helper'
import { PostSegmentCreate } from '../api/post-segment'
import { PostSegmentItemCreate } from '../api/post-segment-items'
import { PostSegmentItemUpdate } from '../api/post-segment-items/[postSegmentItemId]'
import {
  PostPostAPI,
  PostSegmentItemPostAPI,
  PostSegmentPostAPI,
} from '../api/posts/[postId]'

// export const getServerSideProps: GetServerSideProps = async ({
//   params,
//   res,
// }) => {
//   if (!params || typeof params.id !== 'string') {
//     res.statusCode = 404
//     return { props: {} }
//   } else {
//     // await new Promise((resolve) => setTimeout(resolve, 5000))

//     const post = await prisma.post.findUnique({
//       where: { id: params.id },
//     })
//     return {
//       props: {
//         initialPost: post,
//       },
//     }
//   }
// }

// export const PostPage: NextPage<{ initialPost: Post | null }> = ({
//   initialPost = null,
// }): JSX.Element => {
export const PostPage = (): JSX.Element => {
  const {
    query: { postId },
  } = useRouter()

  return !!postId && typeof postId === 'string' ? (
    <Wrapper postId={postId} />
  ) : (
    <LoadingAnimation />
  )
}

export default PostPage

function Wrapper({ postId }: { postId: string }) {
  const { post, isLoading, isError } = usePost(postId)

  return (
    <Page>
      {isLoading ? (
        <LoadingAnimation />
      ) : isError ? (
        <ErrorPage statusCode={400}>Error while fetching post</ErrorPage>
      ) : post ? (
        <PostPageWrapper post={post} />
      ) : (
        <p>error?</p>
      )}
    </Page>
  )
}

function PostPageWrapper({ post }: { post: PostPostAPI }) {
  const { createPostSegment, isLoading } = usePost(post.id, false)
  const [segments, setSegments] = useState<PostSegmentPostAPI[]>(post.segments)

  useEffect(() => setSegments(post.segments), [post.segments])

  async function handleCreate(): Promise<void> {
    const postSegmentToCreate: PostSegmentCreate['postSegmentToCreate'] = {
      title: 'New title ' + Math.random(),
      subtitle: 'subtitle ' + Math.random(),
    }
    setSegments((prevSegments) => [
      ...prevSegments,
      {
        postId: post.id,
        id: 'new' + Math.random(),
        title: postSegmentToCreate.title ?? 'new',
        subtitle: postSegmentToCreate.subtitle ?? 'new',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    await createPostSegment({
      postId: post.id,
      postSegmentToCreate,
    })
  }

  return (
    <>
      <PageSection hideTopMargin>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/3">
            <p className="text-5xl text-white">{post.title}</p>
            <p className="italic mt-2">{post.subtitle}</p>
          </div>
          <div className="w-full md:w-1/3">
            <Box>
              <div className="divide-y-1">
                <p className="text-sm">{post.id}</p>
                <p>Created at: {post.createdAt.toISOString()}</p>
                <p>Updated at: {post.updatedAt.toISOString()}</p>
              </div>
            </Box>
          </div>
        </div>
      </PageSection>
      <PageSection>
        <div className="space-y-16">
          {segments.map((segment, index) => (
            <Segment
              index={index + 1}
              postId={post.id}
              key={segment.id}
              segment={segment}
            />
          ))}
        </div>
      </PageSection>
      <PageSection>
        <Button onClick={handleCreate}>Add step</Button>
        {isLoading && <p>loading</p>}
      </PageSection>
    </>
  )
}

function Segment({
  segment,
  index,
  postId,
}: {
  segment: PostSegmentPostAPI
  index: number
  postId: string
}) {
  const { createPostSegmentItem, updatePostSegmentItem, isLoading } = usePost(
    postId,
    false
  )
  const [items, setItems] = useState<PostSegmentItemPostAPI[]>(segment.items)

  useEffect(() => setItems(segment.items), [segment.items])

  async function handleCreate(inputValue: string): Promise<void> {
    const postSegmentItemToCreate: PostSegmentItemCreate['postSegmentItemToCreate'] = {
      content: inputValue,
    }
    setItems((prevItems) => [
      ...prevItems,
      {
        id: 'new' + Math.random(),
        content: postSegmentItemToCreate.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        postSegmentId: segment.id,
      },
    ])

    await createPostSegmentItem({
      postId,
      postSegmentId: segment.id,
      postSegmentItemToCreate,
    })
  }

  return (
    <div className="w-full p-10 rounded-xl bg-gradient-to-br from-teal-300 to-blue-400">
      <h2 className="w-full text-white text-xl">
        <span>{index}</span> <span>{segment.title}</span>{' '}
        <span>{segment.id}</span>
        <span className="float-right">{segment.updatedAt.toISOString()}</span>
      </h2>
      <h2 className="text-gray-500 text-lg italic">{segment.subtitle}</h2>

      <div className="space-y-2 ml-">
        {items.map((item, index) => (
          <Box key={item.id} smallPadding>
            <p
              className="cursor-pointer space-x-2"
              onClick={async () => {
                const postSegmentItemToUpdate: PostSegmentItemUpdate['postSegmentItemToUpdate'] = {
                  ...item,
                  content: 'new item content ' + Math.random(),
                }

                const content = postSegmentItemToUpdate.content
                if (typeof content === 'string') {
                  setItems((prevItems) =>
                    prevItems.map((prevItem) => {
                      if (prevItem.id !== postSegmentItemToUpdate.id) {
                        return prevItem
                      } else {
                        return { ...prevItem, content }
                      }
                    })
                  )

                  await updatePostSegmentItem({
                    postId,
                    postSegmentId: segment.id,
                    postSegmentItemToUpdate,
                  })
                }
              }}
            >
              <span className="inline-block w-20">
                {isLoading && index === items.length - 1 ? 'load' : index + 1}
              </span>
              <span className="inline-block w-64">{item.id}</span>
              <span>{item.content}</span>
              <span>{item.updatedAt.toISOString()}</span>
            </p>
          </Box>
        ))}
      </div>

      <FormInput placeholder="New item" onSubmit={handleCreate}></FormInput>
    </div>
  )
}
