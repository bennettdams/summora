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
  setIsLoading,
  onSuccessfulSubmit,
}: {
  postSegmentItemId: string
  itemContent: string
  index: number
  postId: string
  isEditMode: boolean
  setIsLoading(isLoading: boolean): void
  onSuccessfulSubmit(): void
}): JSX.Element {
  const { isLoading } = usePost(postId)
  const utils = trpc.useContext()

  function invalidate() {
    utils.postSegments.byPostId.invalidate({ postId })
    onSuccessfulSubmit()
  }

  const update = trpc.postSegmentItems.update.useMutation({
    onSuccess: invalidate,
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
  })
  const deleteOne = trpc.postSegmentItems.delete.useMutation({
    onSuccess: invalidate,
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
  })

  const { handleSubmit, register, formState, reset } = useZodForm({
    schema: schemaUpdatePostSegmentItem,
    defaultValues: { segmentItemId: postSegmentItemId, content: itemContent },
    mode: 'onSubmit',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    isInitiallySubmittable: false,
    isLoading: update.isLoading,
    formState,
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
              showLoading={deleteOne.isLoading}
            />
          </>
        ) : (
          <span className="pr-10">{itemContent}</span>
        )}
      </div>
    </Box>
  )
}
