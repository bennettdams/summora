import { PostCategory } from '@prisma/client'
import { useState, useEffect, useRef } from 'react'
import { Box } from '../Box'
import { Button, ButtonAdd } from '../Button'
import { DropdownSelect } from '../DropdownSelect'
import { FormInput } from '../FormInput'
import { IconCheck, IconX, IconTrash, IconEdit } from '../Icon'
import { LoadingAnimation } from '../LoadingAnimation'
import { Page, PageSection } from '../Page'
import { usePost } from '../../data/post-helper'
import { useHover } from '../../util/use-hover'
import { useOnClickOutside } from '../../util/use-on-click-outside'
import { PostSegmentItemCreate } from '../../pages/api/post-segment-items'
import { PostSegmentItemUpdate } from '../../pages/api/post-segment-items/[postSegmentItemId]'
import { PostSegmentCreate } from '../../pages/api/post-segments'
import { PostSegmentUpdate } from '../../pages/api/post-segments/[postSegmentId]'
import {
  PostPostAPI,
  PostSegmentPostAPI,
  PostSegmentItemPostAPI,
} from '../../pages/api/posts/[postId]'
import { Views } from '../Likes'
import { Comments } from '../Comments'

export function PostPageWrapper({
  post,
  postCategories,
}: {
  post: PostPostAPI
  postCategories: PostCategory[]
}): JSX.Element {
  const { createPostSegment, isLoading } = usePost(post.id, false)
  const [hasNewSegmentBeenEdited, setHasNewSegmentBeenEdited] = useState(true)
  const newSegmentId = 'new-segment-id'

  const [segments, setSegments] = useState<PostSegmentPostAPI[]>(post.segments)
  useEffect(() => setSegments(post.segments), [post.segments])

  async function handleCreate(): Promise<void> {
    const postSegmentToCreate: PostSegmentCreate['postSegmentToCreate'] = {
      title: '',
      subtitle: '',
    }
    setSegments((prevSegments) => [
      ...prevSegments,
      {
        postId: post.id,
        id: newSegmentId + Math.random(),
        title: postSegmentToCreate.title ?? '',
        subtitle: postSegmentToCreate.subtitle ?? '',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    setHasNewSegmentBeenEdited(false)

    await createPostSegment({
      postId: post.id,
      postSegmentToCreate,
    })
  }

  return (
    <Page>
      <PageSection hideTopMargin>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/3">
            <p className="text-5xl text-white">{post.title}</p>

            <p className="mt-2">
              <span className="uppercase inline-block py-1 px-2 rounded bg-orange-100 text-orange-800 text-xs font-medium tracking-widest">
                {post.category.title}
              </span>
              <span className="italic ml-2">{post.subtitle}</span>
            </p>
          </div>
          <div className="w-full md:w-1/3">
            <Box smallPadding>
              <div className="flex divide-gray-400 divide-x">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 text-center rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>

                  <div className="w-12 h-1 my-2 bg-indigo-500 rounded"></div>

                  <div className="flex flex-col items-center text-center justify-center">
                    <h2 className="font-medium leading-none title-font text-gray-900 text-lg">
                      Username
                    </h2>
                  </div>
                </div>

                <div className="flex-1 text-center">
                  <div>
                    <Views>1.2K</Views>
                    <span className="ml-2">
                      <Comments>6</Comments>
                    </span>
                  </div>
                  <p>
                    Created at: {post.createdAt.getUTCMonth()}-
                    {post.createdAt.getUTCDate()}
                  </p>
                  <p>
                    Updated at: {post.updatedAt.getUTCMonth()}-
                    {post.updatedAt.getUTCDate()}
                  </p>
                </div>
              </div>
            </Box>
            <div>
              <span>Select category:</span>
              <div className="inline">
                <DropdownSelect
                  items={postCategories.map((cat) => ({
                    id: cat.id,
                    title: cat.title,
                  }))}
                  initialItem={post.category}
                />
              </div>
            </div>
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
              segmentExternal={segment}
              isEditableExternal={
                !hasNewSegmentBeenEdited && index === segments.length - 1
              }
              onInitialEdit={() => setHasNewSegmentBeenEdited(true)}
            />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <Button onClick={handleCreate} disabled={!hasNewSegmentBeenEdited}>
          Add step
        </Button>
        {isLoading && <LoadingAnimation />}
      </PageSection>
    </Page>
  )
}

function Segment({
  segmentExternal,
  index,
  postId,
  isEditableExternal = false,
  onInitialEdit,
}: {
  segmentExternal: PostSegmentPostAPI
  index: number
  postId: string
  isEditableExternal?: boolean
  onInitialEdit?: () => void
}) {
  const { createPostSegmentItem, updatePostSegment } = usePost(postId, false)
  const [segment, setSegment] = useState<PostSegmentPostAPI>(segmentExternal)
  useEffect(() => setSegment(segmentExternal), [segmentExternal])
  const [items, setItems] = useState<PostSegmentItemPostAPI[]>(segment.items)
  useEffect(() => setItems(segment.items), [segment.items])

  const [isSegmentEditable, setIsSegmentEditable] = useState(isEditableExternal)
  useEffect(() => setIsSegmentEditable(isEditableExternal), [
    isEditableExternal,
  ])
  const [showItemInput, setShowItemInput] = useState(false)

  const refEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refEdit, () => setIsSegmentEditable(isEditableExternal))
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

  async function handleUpdateSubtitle(inputValue: string): Promise<void> {
    const postSegmentToUpdate: PostSegmentUpdate['postSegmentToUpdate'] = {
      ...segment,
      subtitle: inputValue,
    }

    const subtitle = postSegmentToUpdate.subtitle
    if (typeof subtitle === 'string') {
      setSegment((prevSegment) => ({ ...prevSegment, subtitle }))

      // When creating a segment, the title is editable initially. This resets this.
      if (onInitialEdit) onInitialEdit()

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

  const formIdNew = `post-segment-item-new-${segment.id}`

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
              onSubmit={handleUpdateSubtitle}
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
            itemExternal={item}
            postId={postId}
            segmentId={segment.id}
            index={index}
          />
        ))}
      </div>

      <div className="h-20 flex items-center" ref={refEditItem}>
        {showItemInput ? (
          <>
            <button className="inline" form={formIdNew} type="submit">
              <IconCheck />
            </button>
            <IconX onClick={() => setShowItemInput(false)} className="ml-4" />
            <div className="ml-4 w-full">
              <FormInput
                placeholder="New item"
                formId={formIdNew}
                resetOnSubmit
                onSubmit={handleCreate}
              />
            </div>
          </>
        ) : (
          <ButtonAdd size="huge" onClick={() => setShowItemInput(true)} />
        )}
      </div>
    </div>
  )
}

function PostSegmentItem({
  itemExternal,
  index,
  postId,
  segmentId,
}: {
  itemExternal: PostSegmentItemPostAPI
  index: number
  postId: string
  segmentId: string
}) {
  const { updatePostSegmentItem, isLoading } = usePost(postId, false)
  const [ref, isHovered] = useHover<HTMLDivElement>()

  const [item, setItem] = useState<PostSegmentItemPostAPI>(itemExternal)
  useEffect(() => setItem(itemExternal), [itemExternal])

  const [isEditable, setIsEditable] = useState(false)

  const refEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refEdit, () => setIsEditable(false))

  async function handleUpdate(inputValue: string): Promise<void> {
    const postSegmentItemToUpdate: PostSegmentItemUpdate['postSegmentItemToUpdate'] = {
      ...item,
      content: inputValue,
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
    setIsEditable(false)
  }

  const formId = `post-segment-item-${item.id}`

  return (
    <Box
      key={item.id}
      onClick={() => setIsEditable(true)}
      refExternal={refEdit}
      smallPadding
    >
      <div ref={ref} className="space-x-2 flex items-center">
        <div className="inline-flex italic w-20 items-center">
          {isLoading ? (
            <LoadingAnimation />
          ) : isEditable ? (
            <>
              <button className="inline" form={formId} type="submit">
                <IconCheck />
              </button>
              <IconX onClick={() => setIsEditable(false)} className="ml-4" />
            </>
          ) : isHovered ? (
            <>
              <IconTrash /> <IconEdit className="ml-4" />
            </>
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
        {isEditable ? (
          <>
            <FormInput
              initialValue={item.content}
              placeholder="New item"
              resetOnSubmit
              onSubmit={handleUpdate}
              formId={formId}
            />
          </>
        ) : (
          <span>{item.content}</span>
        )}
        {/* <span className="text-xs inline-block w-64">{item.id}</span> */}
        <span>{item.updatedAt.toISOString()}</span>
      </div>
    </Box>
  )
}
