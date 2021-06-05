import { useState, useEffect, useRef } from 'react'
import { Box } from '../../Box'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconTrash, IconEdit } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { usePost } from '../../../data/post-helper'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { PostSegmentItemUpdate } from '../../../pages/api/post-segment-items/[postSegmentItemId]'
import { PostSegmentItemPostAPI } from '../../../pages/api/posts/[postId]'

export function PostSegmentItem({
  itemExternal,
  index,
  postId,
  segmentId,
}: {
  itemExternal: PostSegmentItemPostAPI
  index: number
  postId: string
  segmentId: string
}): JSX.Element {
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
      isHighlighted={isEditable}
      inline
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
