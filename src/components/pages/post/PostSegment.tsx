import { useState, useEffect, useRef } from 'react'
import { ButtonAdd } from '../../Button'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconEdit } from '../../Icon'
import { usePost } from '../../../data/post-helper'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { PostSegmentItemCreate } from '../../../pages/api/post-segment-items'
import { PostSegmentUpdate } from '../../../pages/api/post-segments/[postSegmentId]'
import {
  PostSegmentPostAPI,
  PostSegmentItemPostAPI,
} from '../../../pages/api/posts/[postId]'
import { PostSegmentItem } from './PostSegmentItem'

export function PostSegment({
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
}): JSX.Element {
  const { createPostSegmentItem, updatePostSegment } = usePost(postId, false)
  const [segment, setSegment] = useState<PostSegmentPostAPI>(segmentExternal)
  useEffect(() => setSegment(segmentExternal), [segmentExternal])
  const [items, setItems] = useState<PostSegmentItemPostAPI[]>(segment.items)
  useEffect(() => setItems(segment.items), [segment.items])

  const [isSegmentEditable, setIsSegmentEditable] = useState(isEditableExternal)
  useEffect(
    () => setIsSegmentEditable(isEditableExternal),
    [isEditableExternal]
  )
  const [showItemInput, setShowItemInput] = useState(false)

  const [refSegmentTitle, isHovered] = useHover<HTMLDivElement>()

  const refSegmentEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refSegmentEdit, () =>
    setIsSegmentEditable(isEditableExternal)
  )
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
    const postSegmentItemToCreate: PostSegmentItemCreate['postSegmentItemToCreate'] =
      {
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
    <div className="w-full p-10 rounded-xl bg-gradient-to-br from-green-100 to-indigo-100">
      <div className="w-full h-20 text-xl flex flex-row items-center">
        <div className="w-20 text-left">
          <span className="text-4xl italic">{index}</span>
        </div>
        {isSegmentEditable ? (
          <div className="flex-grow" ref={refSegmentEdit}>
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
            className="flex-grow flex cursor-pointer hover:text-orange-700"
            onClick={() => setIsSegmentEditable(true)}
            ref={refSegmentTitle}
          >
            {isHovered && (
              <div className="grid place-items-center">
                <IconEdit />
              </div>
            )}

            <div className="ml-6 flex flex-col hover:text-orange-700">
              <div className="flex-1">
                <span>{segment.title}</span> <span>{segment.id}</span>
                <span className="float-right">
                  {segment.updatedAt.toISOString()}
                </span>
              </div>

              <div className="flex-1">
                <span className="text-gray-500 hover:text-orange-700 text-lg italic">
                  {segment.subtitle}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div className="w-full" key={item.id}>
            <PostSegmentItem
              itemExternal={item}
              postId={postId}
              segmentId={segment.id}
              index={index}
            />
          </div>
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
