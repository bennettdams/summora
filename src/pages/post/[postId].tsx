import ErrorPage from 'next/error'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Box } from '../../components/Box'
import { Button } from '../../components/Button'
import { FormInput } from '../../components/FormInput'
import { LoadingAnimation } from '../../components/LoadingAnimation'
import { Page, PageSection } from '../../components/Page'
import { usePost } from '../../data/post-helper'
import { PostSegmentCreate } from '../api/post-segment'
import { PostSegmentUpdate } from '../api/post-segment/[postSegmentId]'
import { PostSegmentItemCreate } from '../api/post-segment-items'
import { PostSegmentItemUpdate } from '../api/post-segment-items/[postSegmentItemId]'
import {
  PostPostAPI,
  PostSegmentItemPostAPI,
  PostSegmentPostAPI,
} from '../api/posts/[postId]'
import { useOnClickOutside } from '../../util/use-on-click-outside'

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
              segmentInitial={segment}
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
  segmentInitial,
  index,
  postId,
}: {
  segmentInitial: PostSegmentPostAPI
  index: number
  postId: string
}) {
  const { createPostSegmentItem, updatePostSegment } = usePost(postId, false)
  const [segment, setSegment] = useState<PostSegmentPostAPI>(segmentInitial)
  useEffect(() => setSegment(segmentInitial), [segmentInitial])
  const [items, setItems] = useState<PostSegmentItemPostAPI[]>(segment.items)
  useEffect(() => setItems(segment.items), [segment.items])

  const [isSegmentEditable, setIsSegmentEditable] = useState(false)
  const [showItemInput, setShowItemInput] = useState(false)

  const refEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refEdit, () => setIsSegmentEditable(false))
  const refEditItem = useRef<HTMLDivElement>(null)
  useOnClickOutside(refEditItem, () => setShowItemInput(false))

  async function handleUpdateTitle(inputValue: string): Promise<void> {
    const postSegmentToUpdate: PostSegmentUpdate['postSegmentToUpdate'] = {
      ...segment,
      title: inputValue,
    }

    const title = postSegmentToUpdate.title
    if (typeof title === 'string') {
      setSegment((prevSegment) => ({ ...prevSegment, title }))

      await updatePostSegment({
        postId,
        postSegmentToUpdate,
      })
    }
    setIsSegmentEditable(false)
  }

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
    <div className="w-full p-10 rounded-xl bg-gradient-to-br from-green-50 to-teal-50">
      <div className="w-full h-20 text-xl flex flex-row items-center">
        <div className="w-20 text-left">
          <span className="text-4xl italic">{index}</span>
        </div>
        {isSegmentEditable ? (
          <div className="flex-grow" ref={refEdit}>
            <FormInput
              placeholder="Title.."
              initialValue={segment.title}
              onSubmit={handleUpdateTitle}
            />
            <FormInput
              placeholder="Subitle.."
              initialValue={segment.subtitle || ''}
              onSubmit={handleUpdateTitle}
              autoFocus={false}
            />
          </div>
        ) : (
          <div
            className="flex-grow flex flex-col"
            onClick={() => setIsSegmentEditable(true)}
          >
            <div className="flex-1">
              <span>{segment.title}</span> <span>{segment.id}</span>
              <span className="float-right">
                {segment.updatedAt.toISOString()}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-gray-500 text-lg italic">
                {segment.subtitle}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <PostSegmentItem
            key={item.id}
            itemInitial={item}
            postId={postId}
            segmentId={segment.id}
            index={index}
          />
        ))}
      </div>

      <div className="h-20 flex items-center" ref={refEditItem}>
        {showItemInput ? (
          <FormInput
            placeholder="New item"
            resetOnSubmit
            onSubmit={handleCreate}
          />
        ) : (
          <Button onClick={() => setShowItemInput(true)}>Add item</Button>
        )}
      </div>
    </div>
  )
}

function PostSegmentItem({
  itemInitial,
  index,
  postId,
  segmentId,
}: {
  itemInitial: PostSegmentItemPostAPI
  index: number
  postId: string
  segmentId: string
}) {
  const [item, setItem] = useState<PostSegmentItemPostAPI>(itemInitial)
  const { updatePostSegmentItem, isLoading } = usePost(postId, false)

  useEffect(() => setItem(itemInitial), [itemInitial])

  return (
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
            setItem((prevItem) => ({ ...prevItem, content }))

            await updatePostSegmentItem({
              postId,
              postSegmentId: segmentId,
              postSegmentItemToUpdate,
            })
          }
        }}
      >
        <span className="inline-block italic w-20">
          {isLoading ? 'load' : index + 1}
        </span>
        <span className="inline-block w-64">{item.id}</span>
        <span>{item.content}</span>
        <span>{item.updatedAt.toISOString()}</span>
      </p>
    </Box>
  )
}
