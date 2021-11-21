import { useState, useEffect, useRef } from 'react'
import { ButtonAdd } from '../../Button'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconEdit } from '../../Icon'
import { usePost } from '../../../data/use-post'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { PostSegmentItem } from './PostSegmentItem'
import {
  ApiPostSegmentItemCreateRequestBody,
  ApiPostSegmentUpdateRequestBody,
} from '../../../services/api-service'
import { SegmentPostPage } from './PostPage'

export function PostSegment({
  segment,
  index,
  postId,
  isEditableInitial = false,
  isPostEditMode = false,
  onInitialEdit,
}: {
  segment: SegmentPostPage
  index: number
  postId: string
  isEditableInitial: boolean
  isPostEditMode: boolean
  onInitialEdit: () => void
}): JSX.Element {
  const { createPostSegmentItem, updatePostSegment } = usePost(postId)

  const [isSegmentEditable, setIsSegmentEditable] = useState(isEditableInitial)
  useEffect(() => setIsSegmentEditable(isEditableInitial), [isEditableInitial])
  const [showItemInput, setShowItemInput] = useState(false)

  const [refSegmentTitle, isHovered] = useHover<HTMLDivElement>()

  const refSegmentEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refSegmentEdit, () =>
    setIsSegmentEditable(isEditableInitial)
  )
  const refEditItem = useRef<HTMLDivElement>(null)
  useOnClickOutside(refEditItem, () => setShowItemInput(false))

  async function handleUpdateTitle(inputValue: string): Promise<void> {
    if (inputValue) {
      const postSegmentToUpdate: ApiPostSegmentUpdateRequestBody = {
        title: inputValue,
      }

      setIsSegmentEditable(false)

      await updatePostSegment({
        postSegmentId: segment.id,
        postSegmentToUpdate,
      })
    }
  }

  async function handleUpdateSubtitle(inputValue: string): Promise<void> {
    if (inputValue) {
      const postSegmentToUpdate: ApiPostSegmentUpdateRequestBody = {
        subtitle: inputValue,
      }

      // When creating a segment, the title is editable initially. This resets this.
      if (onInitialEdit) onInitialEdit()

      setIsSegmentEditable(false)

      await updatePostSegment({
        postSegmentId: segment.id,
        postSegmentToUpdate,
      })
    }
  }

  async function handleCreate(inputValue: string): Promise<void> {
    const postSegmentItemToCreate: ApiPostSegmentItemCreateRequestBody['postSegmentItemToCreate'] =
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
      postSegmentId: segment.id,
      postSegmentItemToCreate,
    })
  }

  const formIdNew = `post-segment-item-new-${segment.id}`

  return (
    <div className="w-full p-10 rounded-xl bg-gradient-to-br from-green-100 to-indigo-100">
      <div className="w-full h-20 text-xl flex flex-row">
        <div className="w-20 h-full text-left">
          <span className="text-4xl italic">{index}</span>
        </div>
        {isPostEditMode && isSegmentEditable ? (
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
            className={`flex-grow flex hover:text-orange-700 ${
              isPostEditMode && 'cursor-pointer'
            }`}
            onClick={() => setIsSegmentEditable(true)}
            ref={refSegmentTitle}
          >
            {isPostEditMode && isHovered && (
              <div className="grid place-items-center">
                <IconEdit />
              </div>
            )}

            <div className="ml-2 flex flex-col hover:text-orange-700">
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
        {segment.items.map((item, index) => (
          <div className="w-full" key={item.id}>
            <PostSegmentItem
              item={item}
              postId={postId}
              index={index}
              isPostEditMode={isPostEditMode}
            />
          </div>
        ))}
      </div>

      {isPostEditMode && (
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
      )}
    </div>
  )
}
