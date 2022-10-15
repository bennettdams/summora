import { usePost } from '../../../data/use-post'
import { Box } from '../../Box'
import { ButtonRemove } from '../../Button'
import { FormInput } from '../../FormInput'
import { LoadingAnimation } from '../../LoadingAnimation'

export function PostSegmentItem({
  postSegmentItemId,
  itemContent,
  index,
  postId,
  isEditMode = false,
  onChange,
}: {
  postSegmentItemId: string
  itemContent: string
  index: number
  postId: string
  isEditMode: boolean
  onChange: (inputNew: string) => void
}): JSX.Element {
  const { deletePostSegmentItem, isLoading } = usePost(postId)

  return (
    <Box key={postSegmentItemId} padding={false} isHighlighted={isEditMode}>
      <div className="flex items-center space-x-2 p-2">
        <div className="ml-2 inline-flex w-10 items-center italic">
          {isLoading ? (
            <LoadingAnimation />
          ) : (
            <span className="text-dorange">{index + 1}</span>
          )}
        </div>

        {isEditMode ? (
          <>
            <FormInput
              inputId={`${postSegmentItemId}-content`}
              initialValue={itemContent}
              placeholder="Add some text.."
              resetOnSubmit
              onChange={onChange}
            />
            <ButtonRemove
              onClick={async () => {
                await deletePostSegmentItem(postSegmentItemId)
              }}
            />
          </>
        ) : (
          <span className="pr-10">{itemContent}</span>
        )}
      </div>
    </Box>
  )
}
