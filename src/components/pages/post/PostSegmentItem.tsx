import { usePost } from '../../../data/use-post'
import { schemaUpdatePostSegmentItem } from '../../../lib/schemas'
import { trpc } from '../../../util/trpc'
import { useZodForm } from '../../../util/use-zod-form'
import { Box } from '../../Box'
import { ButtonRemove } from '../../Button'
import { Form, Input, useIsSubmitEnabled } from '../../form'
import { LoadingAnimation } from '../../LoadingAnimation'

export function PostSegmentItem({
  postSegmentItemId,
  itemContent,
  index,
  postId,
  isEditMode = false,
}: {
  postSegmentItemId: string
  itemContent: string
  index: number
  postId: string
  isEditMode: boolean
}): JSX.Element {
  const { isLoading } = usePost(postId)
  const utils = trpc.useContext()

  function invalidate() {
    utils.postSegments.byPostId.invalidate({ postId })
  }

  const update = trpc.postSegmentItems.update.useMutation({
    onSuccess: invalidate,
  })
  const deleteOne = trpc.postSegmentItems.delete.useMutation({
    onSuccess: invalidate,
  })

  const { handleSubmit, register, formState, reset } = useZodForm({
    schema: schemaUpdatePostSegmentItem,
    defaultValues: { segmentItemId: postSegmentItemId, content: itemContent },
    mode: 'onSubmit',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    isInitiallySubmittable: false,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    submitCount: formState.submitCount,
    isSubmitting: formState.isSubmitting,
    isValidating: formState.isValidating,
    isLoading: update.isLoading,
  })

  return (
    <Box key={postSegmentItemId} padding={false} isHighlighted={isEditMode}>
      <div className="flex items-center space-x-2">
        <div className="ml-2 inline-flex w-10 items-center italic">
          {isLoading ? (
            <LoadingAnimation />
          ) : (
            <span className="text-dorange">{index + 1}</span>
          )}
        </div>

        {isEditMode ? (
          <>
            <Form
              className="w-full space-y-4"
              onBlur={handleSubmit((data) => {
                // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
                if (isSubmitEnabled) {
                  update.mutate({
                    segmentItemId: postSegmentItemId,
                    content: data.content,
                  })

                  /*
                   * Reset the default values to our new data.
                   * This is done to "set" the validation to the newly
                   * updated values.
                   * See: https://react-hook-form.com/api/useform/reset
                   */
                  reset(data)
                }
              })}
            >
              <Input
                {...register('content')}
                placeholder="Enter some text.."
                validationErrorMessage={formState.errors.content?.message}
              />
            </Form>

            <ButtonRemove
              onClick={() => {
                deleteOne.mutate({ segmentItemId: postSegmentItemId })
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
