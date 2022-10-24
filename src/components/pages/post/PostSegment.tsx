import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRef, useState } from 'react'
import { z } from 'zod'
import {
  schemaCreatePostSegmentItem,
  schemaUpdatePostSegment,
} from '../../../lib/schemas'
import { formatDateTime } from '../../../util/date-time'
import { trpc } from '../../../util/trpc'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { useZodForm } from '../../../util/use-zod-form'
import { ButtonRemove } from '../../Button'
import { ChoiceSelect, useChoiceSelect } from '../../ChoiceSelect'
import { EditOverlay } from '../../EditOverlay'
import { Form, FormLabel, Input, useIsSubmitEnabled } from '../../form'
import { IconArrowCircleDown, IconArrowCircleRight } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { PostSegmentImage } from '../../PostSegmentImage'
import { SegmentPostPage } from './PostPage'
import { PostSegmentItem } from './PostSegmentItem'

type SchemaUpdateSegment = z.infer<typeof schemaUpdatePostSegment>

export function PostSegment({
  postSegmentId,
  segment,
  sequenceNumber,
  isLastInSequence,
  postId,
  authorId,
  isPostEditable = false,
}: {
  postSegmentId: string
  segment: SegmentPostPage
  sequenceNumber: number
  isLastInSequence: boolean
  postId: string
  authorId: string
  isPostEditable: boolean
}): JSX.Element {
  const [lastSuccessfulEdit, setLastSuccessfulEdit] = useState<Date | null>(
    null
  )
  const [isItemLoading, setIsItemLoading] = useState(false)

  const utils = trpc.useContext()

  function createSuccessfulEditStatus() {
    setLastSuccessfulEdit(new Date())
  }

  async function invalidate() {
    await utils.postSegments.byPostId.invalidate({ postId })
    createSuccessfulEditStatus()
  }

  const edit = trpc.postSegments.edit.useMutation({
    onSuccess: invalidate,
  })
  const createItem = trpc.postSegments.createItem.useMutation({
    onSuccess: invalidate,
  })
  const deleteSegment = trpc.postSegments.delete.useMutation({
    onSuccess: invalidate,
  })

  const {
    handleSubmit: handleSubmitCreateItem,
    register: registerCreateItem,
    formState: formStateCreateItem,
    reset: resetCreateItem,
  } = useZodForm({
    schema: schemaCreatePostSegmentItem.pick({ content: true }),
    defaultValues: { content: '' },
    mode: 'onChange',
  })

  const isSubmitCreateItemEnabled = useIsSubmitEnabled({
    isInitiallySubmittable: false,
    isLoading: createItem.isLoading,
    formState: formStateCreateItem,
  })

  const [isSegmentEditMode, setIsSegmentEditMode] = useState(
    // segments without a title should be considered "new" and are shown in edit mode initially
    () => !segment.title
  )

  const refSegmentEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refSegmentEdit, () => {
    setLastSuccessfulEdit(null)
    setIsSegmentEditMode(false)
  })

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  const choiceControl = useChoiceSelect(
    [
      { choiceId: 'right', label: 'Right', icon: <IconArrowCircleRight /> },
      { choiceId: 'bottom', label: 'Bottom', icon: <IconArrowCircleDown /> },
    ],
    'right'
  )

  const defaultValuesUpdate: SchemaUpdateSegment = {
    postSegmentId: segment.id,
    title: segment.title,
    subtitle: segment.subtitle ?? undefined,
  }

  const {
    handleSubmit: handleSubmitUpdate,
    register: registerUpdate,
    formState: formStateUpdate,
    reset: resetUpdate,
  } = useZodForm({
    schema: schemaUpdatePostSegment,
    defaultValues: defaultValuesUpdate,
    mode: 'onSubmit',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    isInitiallySubmittable: false,
    isLoading: edit.isLoading,
    formState: formStateUpdate,
  })

  return (
    // items-stretch needed for the post image
    <div
      ref={refSegmentEdit}
      className="flex w-full flex-col items-stretch rounded-xl bg-white p-8 shadow-2xl lg:flex-row"
    >
      <div
        className={`px-4 ${
          choiceControl.selected.choiceId === 'right' ? 'w-4/5' : 'w-full'
        }`}
      >
        {/* HEADER & ITEMS */}
        <EditOverlay
          isEnabled={isPostEditable && !isSegmentEditMode}
          onClick={() => isPostEditable && setIsSegmentEditMode(true)}
        >
          <div className="rounded-xl">
            <Form
              className="w-full space-y-4"
              onBlur={handleSubmitUpdate((data) => {
                // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
                if (isSubmitEnabled) {
                  edit.mutate({
                    postSegmentId,
                    title: data.title,
                    subtitle: data.subtitle,
                  })

                  /*
                   * Reset the default values to our new data.
                   * This is done to "set" the validation to the newly
                   * updated values.
                   * See: https://react-hook-form.com/api/useform/reset
                   */
                  resetUpdate(data)
                }
              })}
            >
              <div className="flex w-full flex-row text-xl">
                <div className="h-full w-20 text-left">
                  <span className="text-4xl italic">{sequenceNumber}</span>
                </div>

                {/* SEGMENT HEADER */}
                {isSegmentEditMode ? (
                  <div className="grow space-y-6">
                    <div>
                      <FormLabel>Title</FormLabel>
                      <Input
                        {...registerUpdate('title')}
                        hasLabel
                        placeholder="Enter a title.."
                        autoFocus={
                          !defaultValuesUpdate.title && isLastInSequence
                        }
                        defaultValue={defaultValuesUpdate.title}
                        validationErrorMessage={
                          formStateUpdate.errors.title?.message
                        }
                      />
                    </div>
                    <div>
                      <FormLabel>Subtitle</FormLabel>
                      <Input
                        {...registerUpdate('subtitle')}
                        placeholder="Enter a subtitle.."
                        defaultValue={defaultValuesUpdate.subtitle}
                        validationErrorMessage={
                          formStateUpdate.errors.subtitle?.message
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex grow ${
                      isPostEditable && 'cursor-pointer'
                    }`}
                  >
                    <div className="ml-2 flex flex-col">
                      <div className="flex-1 text-dlila">
                        <span>{segment.title}</span>
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
            </Form>

            {/* SEGMENT ITEMS */}
            {/* `relative` here needed for auto-animate. Without it, the edit overlay is shown loosely below the list, instead of overlaying the list. */}
            <div ref={animateRef} className="relative mt-8 space-y-4">
              {segment.items.map((item, index) => (
                <PostSegmentItem
                  key={item.id}
                  index={index}
                  isEditMode={isSegmentEditMode}
                  itemContent={item.content}
                  postId={postId}
                  postSegmentItemId={item.id}
                  setIsLoading={(isLoadingNew) =>
                    setIsItemLoading(isLoadingNew)
                  }
                  onSuccessfulSubmit={createSuccessfulEditStatus}
                />
              ))}
            </div>
          </div>
        </EditOverlay>

        {/* EDIT ACTIONS */}
        {isSegmentEditMode && (
          <>
            <p className="my-6 text-center text-xl text-dlila">
              ..or add a new item:
            </p>

            <Form
              onBlur={handleSubmitCreateItem((data) => {
                console.log(
                  'isSubmitCreateItemEnabled',
                  isSubmitCreateItemEnabled
                )
                // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
                if (isSubmitCreateItemEnabled) {
                  createItem.mutate({
                    segmentId: postSegmentId,
                    content: data.content,
                  })

                  /*
                   * Reset the default values to our new data.
                   * This is done to "set" the validation to the newly
                   * updated values.
                   * See: https://react-hook-form.com/api/useform/reset
                   */
                  resetCreateItem({ content: '' })
                }
              })}
              className="my-4 flex w-full items-center space-x-4"
            >
              <div className="grow">
                <Input
                  {...registerCreateItem('content')}
                  placeholder="Enter some text.."
                  validationErrorMessage={
                    formStateCreateItem.errors.content?.message
                  }
                />
              </div>
            </Form>

            <div className="my-2 text-center italic">
              {/* height needed to not make it jump when the loading animation is shown */}
              <p className="h-6 tracking-tighter">
                {edit.isLoading || isItemLoading || createItem.isLoading ? (
                  <LoadingAnimation size="small" />
                ) : !lastSuccessfulEdit ? (
                  <span>No changes yet.</span>
                ) : (
                  <>
                    <span>Saved changes</span>
                    <span className="ml-2 text-gray-400">
                      {formatDateTime(lastSuccessfulEdit, 'MM-DD hh:mm:ss')}
                    </span>
                  </>
                )}
              </p>
            </div>
          </>
        )}

        {/* POST IMAGE */}
        {choiceControl.selected.choiceId === 'bottom' && (
          <div className="grid min-h-[250px] w-full place-items-center">
            <PostSegmentImage
              isEditable={isPostEditable}
              postId={postId}
              authorId={authorId}
              postSegmentId={postSegmentId}
              imageId={segment.imageId}
            />
          </div>
        )}

        {isPostEditable && (
          <div className="mt-4 flex flex-row justify-between">
            <ButtonRemove
              showLoading={deleteSegment.isLoading}
              onClick={() => deleteSegment.mutate({ segmentId: postSegmentId })}
            >
              Remove segment
            </ButtonRemove>

            <ChoiceSelect control={choiceControl} />
          </div>
        )}
      </div>

      {/* POST IMAGE */}
      {/* the parent container uses "items-stretch" so the image can "fill" the height */}
      {choiceControl.selected.choiceId === 'right' && (
        <div className="grid min-h-[150px] w-full place-items-center lg:w-1/5">
          <PostSegmentImage
            isEditable={isPostEditable}
            postId={postId}
            authorId={authorId}
            postSegmentId={postSegmentId}
            imageId={segment.imageId}
          />
        </div>
      )}
    </div>
  )
}
