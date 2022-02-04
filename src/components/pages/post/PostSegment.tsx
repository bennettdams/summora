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
import { PostSegmentImage } from '../../PostSegmentImage'

export function PostSegment({
  postSegmentId,
  segment,
  index,
  postId,
  authorId,
  isEditableInitial = false,
  isPostEditMode = false,
  onInitialEdit,
}: {
  postSegmentId: string
  segment: SegmentPostPage
  index: number
  postId: string
  authorId: string
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
        postSegmentId,
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
        postSegmentId,
        postSegmentToUpdate,
      })
    }
  }

  async function handleCreate(inputValue: string): Promise<void> {
    const postSegmentItemToCreate: ApiPostSegmentItemCreateRequestBody['postSegmentItemToCreate'] =
      {
        content: inputValue,
      }

    await createPostSegmentItem({
      postSegmentId,
      postSegmentItemToCreate,
    })
  }

  const formIdNew = `post-segment-item-new-${postSegmentId}`

  return (
    // items-stretch needed for the post image
    <div className="flex w-full items-stretch rounded-xl bg-gradient-to-br from-green-50 to-indigo-50 p-10 shadow-2xl">
      <div className="w-4/5">
        <div className="flex h-20 w-full flex-row text-xl">
          <div className="h-full w-20 text-left">
            <span className="text-4xl italic">{index}</span>
          </div>
          {isPostEditMode && isSegmentEditable ? (
            <div className="grow" ref={refSegmentEdit}>
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
              className={`flex grow ${
                isPostEditMode && 'cursor-pointer hover:text-orange-700'
              }`}
              onClick={() => setIsSegmentEditable(true)}
              ref={refSegmentTitle}
            >
              {isPostEditMode && isHovered && (
                <div className="grid place-items-center">
                  <IconEdit />
                </div>
              )}

              <div className="ml-2 flex flex-col">
                <div className="flex-1 text-lime-600">
                  <span>{segment.title}</span> <span>{postSegmentId}</span>
                </div>

                <div className="flex-1">
                  <span className="text-lg italic text-gray-400">
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
          <div className="flex h-20 items-center" ref={refEditItem}>
            {showItemInput ? (
              <>
                <button className="inline" form={formIdNew} type="submit">
                  <IconCheck />
                </button>
                <IconX
                  onClick={() => setShowItemInput(false)}
                  className="ml-4"
                />
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

      {/* POST IMAGE */}
      {/* the parent container uses "items-stretch" so the image can "fill" the height */}
      <div className="grid w-1/5 place-items-center bg-red-100">
        {segment.imageId && (
          <PostSegmentImage
            isEditable={isPostEditMode}
            postId={postId}
            authorId={authorId}
            postSegmentId={postSegmentId}
            imageId={segment.imageId}
          />
        )}
      </div>
    </div>
  )
}
