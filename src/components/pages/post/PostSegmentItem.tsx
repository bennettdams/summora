import { useState, useRef } from 'react'
import { Box } from '../../Box'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconTrash, IconEdit } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { usePost } from '../../../data/use-post'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { ApiPostSegmentItemUpdateRequestBody } from '../../../services/api-service'
import { SegmentItemPostPage } from './PostPage'

export function PostSegmentItem({
  item,
  index,
  postId,
  isPostEditMode = false,
}: {
  item: SegmentItemPostPage
  index: number
  postId: string
  isPostEditMode: boolean
}): JSX.Element {
  const { updatePostSegmentItem, isLoading } = usePost(postId)
  const [ref, isHovered] = useHover<HTMLDivElement>()

  const [isEditable, setIsEditable] = useState(false)

  const refEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refEdit, () => setIsEditable(false))

  async function handleUpdate(inputValue: string): Promise<void> {
    if (inputValue) {
      const postSegmentItemToUpdate: ApiPostSegmentItemUpdateRequestBody = {
        content: inputValue,
      }

      setIsEditable(false)

      await updatePostSegmentItem({
        postSegmentItemId: item.id,
        postSegmentItemToUpdate,
      })
    }
  }

  const formId = `post-segment-item-${item.id}`

  return (
    <Box
      key={item.id}
      onClick={!isPostEditMode ? undefined : () => setIsEditable(true)}
      refExternal={refEdit}
      padding={false}
      isHighlighted={isEditable}
      inline
    >
      <div ref={ref} className="space-x-2 p-2 flex items-center">
        <div className="inline-flex italic ml-2 w-10 items-center">
          {!isPostEditMode ? (
            <span>{index + 1}</span>
          ) : isLoading ? (
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
          <span className="pr-10">{item.content}</span>
        )}
      </div>
    </Box>
  )
}
