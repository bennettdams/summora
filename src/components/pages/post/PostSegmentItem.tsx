import { Box } from '../../Box'
import { FormInput } from '../../FormInput'
import { LoadingAnimation } from '../../LoadingAnimation'
import { usePost } from '../../../data/use-post'
import { SegmentItemPostPage } from './PostPage'
import { ButtonRemove } from '../../Button'

export function PostSegmentItem({
  item,
  index,
  postId,
  isEditMode = false,
  onChange,
}: {
  item: SegmentItemPostPage
  index: number
  postId: string
  isEditMode: boolean
  onChange: (inputNew: string) => void
}): JSX.Element {
  const { deletePostSegmentItem, isLoading } = usePost(postId)

  const isEditable = isEditMode

  return (
    <Box key={item.id} padding={false} isHighlighted={isEditable}>
      <div
        className={`flex items-center space-x-2 p-2 ${
          !isEditMode && 'group-hover:bg-dbrown'
        }`}
      >
        <div className="ml-2 inline-flex w-10 items-center italic">
          {isLoading ? (
            <LoadingAnimation />
          ) : (
            <span className="text-dorange">{index + 1}</span>
          )}
        </div>

        {isEditable ? (
          <>
            <FormInput
              initialValue={item.content}
              placeholder="Add some text.."
              resetOnSubmit
              onChange={onChange}
            />
            <ButtonRemove
              onClick={async () => {
                await deletePostSegmentItem(item.id)
              }}
            />
          </>
        ) : (
          <span className="pr-10">{item.content}</span>
        )}
      </div>
    </Box>
  )
}
