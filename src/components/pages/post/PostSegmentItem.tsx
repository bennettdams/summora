import { useState } from 'react'
import { Box } from '../../Box'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconTrash, IconEdit } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { usePost } from '../../../data/use-post'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { ApiPostSegmentItemUpdateRequestBody } from '../../../services/api-service'
import { SegmentItemPostPage } from './PostPage'
import { ButtonRemove } from '../../Button'

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
  const { updatePostSegmentItem, deletePostSegmentItem, isLoading } =
    usePost(postId)

  const [isEditable, setIsEditable] = useState(false)

  const [refEdit, isHovered] = useHover<HTMLDivElement>()
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
    >
      <div className="flex items-center space-x-2 p-2">
        <div className="ml-2 inline-flex w-10 items-center italic">
          {!isPostEditMode ? (
            <span>{index + 1}</span>
          ) : isLoading ? (
            <LoadingAnimation />
          ) : isEditable ? (
            <>
              <button className="inline" form={formId} type="submit">
                <IconCheck />
              </button>
              <IconX onClick={() => setIsEditable(false)} />
            </>
          ) : isHovered ? (
            <>
              <IconTrash /> <IconEdit onClick={() => setIsEditable(true)} />
            </>
          ) : (
            <span className="text-dorange">{index + 1}</span>
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
            <ButtonRemove onClick={() => deletePostSegmentItem(item.id)} />
          </>
        ) : (
          <span className="pr-10">{item.content}</span>
        )}
      </div>
    </Box>
  )
}
