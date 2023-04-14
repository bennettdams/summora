import { useMemo } from 'react'
import { schemaUpdatePostSegmentItem } from '../../../lib/schemas'
import { trpc } from '../../../util/trpc'
import { useZodForm } from '../../../util/use-zod-form'
import { Box } from '../../Box'
import { ButtonRemove } from '../../Button'
import { LoadingAnimation } from '../../LoadingAnimation'
import { Form, Input, useIsSubmitEnabled } from '../../form'

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

  const isLoading = update.isLoading || deleteOne.isLoading

  const defaultValues = useMemo(
    () => ({ segmentItemId: postSegmentItemId, content: itemContent }),
    [itemContent, postSegmentItemId]
  )

  const {
    handleSubmit,
    register,
    formState: {
      errors: { content: errorContent },
    },
    control,
  } = useZodForm({
    schema: schemaUpdatePostSegmentItem,
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    isLoading: update.isLoading,
    control,
  })

  return (
    <Box
      hideBorder
      key={postSegmentItemId}
      padding={false}
      isHighlighted={isEditMode}
    >
      <div className="flex flex-row items-center">
        <div className="inline-flex basis-10 items-center italic">
          {isLoading ? (
            <LoadingAnimation size="small" />
          ) : (
            <p className="ml-1 text-dsecondary">{index + 1}</p>
          )}
        </div>

        {/*
         * We use conditional CSS instead of conditional rendering so the children are not re-/mounted.
         * This is e.g. needed because there is bug in React where unmounting does not trigger `onBlur`.
         * See: https://github.com/facebook/react/issues/12363
         */}
        <div className={`w-full ${isEditMode ? 'block' : 'hidden'}`}>
          <Form
            onBlur={handleSubmit((data) => {
              // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
              if (isSubmitEnabled) {
                update.mutate({
                  segmentItemId: postSegmentItemId,
                  content: data.content,
                })
              }
            })}
          >
            <Input
              {...register('content')}
              placeholder="Enter some text.."
              blurOnEnterPressed
              validationErrorMessage={errorContent?.message}
            />
          </Form>
        </div>

        <div className={isEditMode ? 'inline' : 'hidden'}>
          <ButtonRemove
            onClick={() => {
              deleteOne.mutate({ segmentItemId: postSegmentItemId })
            }}
            showLoading={deleteOne.isLoading}
          />
        </div>

        <div className={`${!isEditMode ? 'w-full' : 'w-0'}`}>
          <span
            className={`overflow-hidden text-ellipsis ${
              isEditMode ? 'hidden' : 'block pr-4 lg:pr-10'
            }`}
          >
            {itemContent}
          </span>
        </div>
      </div>
    </Box>
  )
}
