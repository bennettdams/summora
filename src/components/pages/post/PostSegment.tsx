import { useState, useEffect, useRef, FormEvent } from 'react'
import { Button, ButtonAdd, ButtonRemove } from '../../Button'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconEdit } from '../../Icon'
import { usePost } from '../../../data/use-post'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { PostSegmentItem } from './PostSegmentItem'
import {
  ApiPostSegmentItemCreateRequestBody,
  ApiPostSegmentItemUpdateRequestBody,
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
  isEditModeInitial = false,
  isPostEditable = false,
  onInitialEdit,
}: {
  postSegmentId: string
  segment: SegmentPostPage
  index: number
  postId: string
  authorId: string
  isEditModeInitial: boolean
  isPostEditable: boolean
  onInitialEdit: () => void
}): JSX.Element {
  const {
    createPostSegmentItem,
    updatePostSegment,
    deletePostSegment,
    updatePostSegmentItem,
  } = usePost(postId)

  const [isSegmentEditMode, setIsSegmentEditMode] = useState(isEditModeInitial)
  useEffect(() => setIsSegmentEditMode(isEditModeInitial), [isEditModeInitial])

  const [showNewItemInput, setShowNewItemInput] = useState(false)

  const refSegmentEdit = useRef<HTMLFormElement>(null)
  useOnClickOutside(refSegmentEdit, () =>
    setIsSegmentEditMode(isEditModeInitial)
  )
  const refNewItem = useRef<HTMLDivElement>(null)
  useOnClickOutside(refNewItem, () => setShowNewItemInput(false))

  const [inputs, setInputs] = useState<{
    title?: string | null
    subtitle?: string | null
    items?: { [itemId: string]: string }
    newItem?: string | null
  } | null>()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (inputs) {
      if (inputs.title) {
        updateTitle(inputs.title)
      }
      if (inputs.subtitle) {
        updateSubtitle(inputs.subtitle)
      }
      if (inputs.newItem) {
        const postSegmentItemToCreate: ApiPostSegmentItemCreateRequestBody['postSegmentItemToCreate'] =
          {
            content: inputs.newItem,
          }

        await createPostSegmentItem({
          postSegmentId,
          postSegmentItemToCreate,
        })
      }
      if (inputs.items) {
        for await (const [itemId, inputNew] of Object.entries(inputs.items)) {
          await updateSegmentItemContent({
            segmentItemId: itemId,
            inputValue: inputNew,
          })
        }
      }
    }

    resetEditMode()
  }

  async function updateTitle(inputValue: string): Promise<void> {
    const postSegmentToUpdate: ApiPostSegmentUpdateRequestBody = {
      title: inputValue,
    }

    await updatePostSegment({
      postSegmentId,
      postSegmentToUpdate,
    })
  }

  async function updateSubtitle(inputValue: string): Promise<void> {
    const postSegmentToUpdate: ApiPostSegmentUpdateRequestBody = {
      subtitle: inputValue,
    }

    // When creating a segment, the title is editable initially. This resets this.
    if (onInitialEdit) onInitialEdit()

    await updatePostSegment({
      postSegmentId,
      postSegmentToUpdate,
    })
  }

  async function updateSegmentItemContent({
    inputValue,
    segmentItemId,
  }: {
    inputValue: string
    segmentItemId: string
  }): Promise<void> {
    if (inputValue) {
      const postSegmentItemToUpdate: ApiPostSegmentItemUpdateRequestBody = {
        content: inputValue,
      }

      await updatePostSegmentItem({
        postSegmentItemId: segmentItemId,
        postSegmentItemToUpdate,
      })
    }
  }

  function resetEditMode() {
    setIsSegmentEditMode(false)
    setInputs(null)
  }

  const formId = `post-segment-update-${postSegmentId}`

  return (
    // items-stretch needed for the post image
    <div className="flex w-full flex-col items-stretch rounded-xl bg-white p-8 shadow-2xl lg:flex-row">
      <form
        ref={refSegmentEdit}
        id={formId}
        onSubmit={handleSubmit}
        className="w-full space-y-4 lg:w-4/5"
      >
        {/* HEADER & ITEMS */}
        <div
          // relative is needed for the edit icon to be absolute in the middle
          className={`group relative rounded-xl p-2 ${
            !isSegmentEditMode && 'hover:bg-dbrown'
          }`}
        >
          <div className="flex h-20 w-full flex-row text-xl">
            <div className="h-full w-20 text-left">
              <span className="text-4xl italic">{index}</span>
            </div>

            {/* SEGMENT HEADER */}
            {isPostEditable && isSegmentEditMode ? (
              <div className="grow">
                <FormInput
                  formId={formId}
                  placeholder="Title.."
                  initialValue={segment.title}
                  onChange={(input) =>
                    setInputs((prev) => ({ ...prev, title: input }))
                  }
                />
                <FormInput
                  formId={formId}
                  placeholder="Subtitle.."
                  initialValue={segment.subtitle || ''}
                  onChange={(input) =>
                    setInputs((prev) => ({ ...prev, subtitle: input }))
                  }
                  autoFocus={false}
                />
              </div>
            ) : (
              <div
                className={`flex grow ${isPostEditable && 'cursor-pointer'}`}
                onClick={() => setIsSegmentEditMode(true)}
              >
                {isPostEditable && (
                  <div
                    onClick={() => setIsSegmentEditMode(true)}
                    className="absolute inset-0 hidden place-items-center group-hover:grid"
                  >
                    <IconEdit
                      className="text-transparent group-hover:text-white group-hover:opacity-100"
                      size="huge"
                    />
                  </div>
                )}

                <div className="ml-2 flex flex-col">
                  <div className="flex-1 text-dlila">
                    <span>{segment.title}</span> <span>{postSegmentId}</span>
                  </div>

                  <div className="flex-1">
                    <span className="text-lg italic text-dorange">
                      {segment.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEGMENT ITEMS */}
          <div className="mt-2 space-y-2">
            {segment.items.map((item, index) => (
              <div className="w-full" key={item.id}>
                <PostSegmentItem
                  item={item}
                  postId={postId}
                  index={index}
                  onChange={(input) =>
                    setInputs((prev) => ({
                      ...prev,
                      items: { ...prev?.items, [item.id]: input },
                    }))
                  }
                  isEditMode={isSegmentEditMode}
                />
              </div>
            ))}
          </div>
        </div>

        {/* EDIT ACTIONS */}
        {isPostEditable && (
          <div className="flex items-center" ref={refNewItem}>
            {/* NEW ITEM */}
            {showNewItemInput ? (
              <>
                <button className="inline" form={formId} type="submit">
                  <IconCheck />
                </button>
                <IconX
                  onClick={() => setShowNewItemInput(false)}
                  className="ml-4"
                />
                <div className="ml-4 w-full">
                  <FormInput
                    key={Math.random()}
                    placeholder="New item"
                    formId={formId}
                    initialValue={inputs?.newItem ?? undefined}
                    onChange={(input) =>
                      setInputs((prev) => ({
                        ...prev,
                        newItem: input,
                      }))
                    }
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-4">
                <div>
                  <ButtonAdd
                    size="big"
                    onClick={() => setShowNewItemInput(true)}
                  />
                </div>

                {isSegmentEditMode && (
                  <div>
                    <Button
                      isSubmit
                      onClick={() => {
                        // TODO placeholder, remove when we have FormSubmit button
                      }}
                    >
                      <IconCheck /> Save
                    </Button>
                    <Button
                      onClick={(e) => {
                        // prevent form submit
                        e.preventDefault()
                        resetEditMode()
                      }}
                    >
                      <IconX /> Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <ButtonRemove onClick={() => deletePostSegment(segment.id)}>
            Remove segment
          </ButtonRemove>
        </div>
      </form>

      {/* POST IMAGE */}
      {/* the parent container uses "items-stretch" so the image can "fill" the height */}
      <div className="grid min-h-[150px] w-full place-items-center lg:w-1/5">
        <PostSegmentImage
          isEditable={isPostEditable}
          postId={postId}
          authorId={authorId}
          postSegmentId={postSegmentId}
          imageId={segment.imageId}
        />
      </div>
    </div>
  )
}
