import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { usePost } from '../../../data/use-post'
import { schemaUpdatePostSegment } from '../../../lib/schemas'
import { trpc } from '../../../util/trpc'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { useZodForm } from '../../../util/use-zod-form'
import { Button, ButtonAddSpecial, ButtonRemove } from '../../Button'
import { ChoiceSelect, useChoiceSelect } from '../../ChoiceSelect'
import { EditOverlay } from '../../EditOverlay'
import { Form, Input, useIsSubmiEnabled } from '../../form'
import {
  IconArrowCircleDown,
  IconArrowCircleRight,
  IconCheck,
  IconX,
} from '../../Icon'
import { PostSegmentImage } from '../../PostSegmentImage'
import { SegmentPostPage } from './PostPage'
import { PostSegmentItem } from './PostSegmentItem'

type SchemaUpdateSegment = z.infer<typeof schemaUpdatePostSegment>
// type SchemaCreateDonationLink = z.infer<typeof schemaCreateDonationLink>

// const defaultValuesCreate: SchemaCreateDonationLink = {
//   address: '',
//   donationProviderId: null,
// }

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
  const { deletePostSegment } = usePost(postId)

  const [isSegmentEditMode, setIsSegmentEditMode] = useState(isEditModeInitial)
  useEffect(() => setIsSegmentEditMode(isEditModeInitial), [isEditModeInitial])

  const [showNewItemInput, setShowNewItemInput] = useState(false)

  const refSegmentEdit = useRef<HTMLFormElement>(null)
  useOnClickOutside(refSegmentEdit, () =>
    setIsSegmentEditMode(isEditModeInitial)
  )
  const refNewItem = useRef<HTMLDivElement>(null)
  useOnClickOutside(refNewItem, () => setShowNewItemInput(false))

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  function resetEditMode() {
    setIsSegmentEditMode(false)
    // setInputs(null)
  }

  const formId = `post-segment-update-${postSegmentId}`

  const choiceControl = useChoiceSelect(
    [
      { choiceId: 'right', label: 'Right', icon: <IconArrowCircleRight /> },
      { choiceId: 'bottom', label: 'Bottom', icon: <IconArrowCircleDown /> },
    ],
    'right'
  )

  // ###########################################
  const utils = trpc.useContext()

  async function invalidate() {
    await utils.postSegments.byPostId.invalidate({ postId })
  }

  const updateMany = trpc.postSegments.edit.useMutation({
    onSuccess: invalidate,
  })

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
    watch: watchUpdate,
  } = useZodForm({
    schema: schemaUpdatePostSegment,
    defaultValues: defaultValuesUpdate,
    mode: 'onSubmit',
  })

  const errorsUpdate = formStateUpdate.errors
  // const errorsCreate = formStateCreate.errors

  // const newProviderIdFromInput = watchCreate('donationProviderId')

  const isSubmitEnabled = useIsSubmiEnabled({
    isInitiallySubmittable: false,
    isValid: formStateUpdate.isValid,
    isDirty: formStateUpdate.isDirty,
    submitCount: formStateUpdate.submitCount,
    isSubmitting: formStateUpdate.isSubmitting,
    isValidating: formStateUpdate.isValidating,
    isLoading: updateMany.isLoading,
  })

  return (
    // items-stretch needed for the post image
    <div className="flex w-full flex-col items-stretch rounded-xl bg-white p-8 shadow-2xl lg:flex-row">
      <div
        className={
          choiceControl.selected.choiceId === 'right' ? 'w-4/5' : 'w-full'
        }
      >
        {/* HEADER & ITEMS */}
        <EditOverlay
          isEnabled={isPostEditable && !isSegmentEditMode}
          onClick={() => isPostEditable && setIsSegmentEditMode(true)}
        >
          <div className="rounded-xl p-2">
            <Form
              className="w-full space-y-4"
              onBlur={handleSubmitUpdate((data) => {
                // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
                if (isSubmitEnabled) {
                  updateMany.mutate({
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
                  <span className="text-4xl italic">{index}</span>
                </div>

                {/* SEGMENT HEADER */}
                {isSegmentEditMode ? (
                  <div className="grow space-y-4">
                    <Input
                      {...registerUpdate('title')}
                      placeholder="Enter a title.."
                      defaultValue={defaultValuesUpdate.title}
                      validationErrorMessage={errorsUpdate.title?.message}
                    />
                    <Input
                      {...registerUpdate('subtitle')}
                      placeholder="Enter a subtitle.."
                      defaultValue={defaultValuesUpdate.subtitle}
                      validationErrorMessage={errorsUpdate.subtitle?.message}
                    />
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
            <div ref={animateRef} className="relative mt-4 space-y-4">
              {segment.items.map((item, index) => (
                <PostSegmentItem
                  key={item.id}
                  index={index}
                  isEditMode={isSegmentEditMode}
                  itemContent={item.content}
                  postId={postId}
                  postSegmentItemId={item.id}
                />
              ))}
            </div>
          </div>
        </EditOverlay>

        {/* EDIT ACTIONS */}
        {isPostEditable && (
          <>
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
                    {/* <FormInput
                      inputId={`${formId}-new-item`}
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
                    /> */}
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-4">
                  <div>
                    <ButtonAddSpecial
                      size="big"
                      onClick={() => setShowNewItemInput(true)}
                    />
                  </div>

                  {isSegmentEditMode && (
                    <div>
                      {/* TODO reset to initial */}
                      <Button
                        icon={<IconX />}
                        onClick={(e) => {
                          // prevent form submit
                          e.preventDefault()
                          resetEditMode()
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
            <ButtonRemove onClick={() => deletePostSegment(segment.id)}>
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
