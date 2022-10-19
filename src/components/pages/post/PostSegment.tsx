import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { usePost } from '../../../data/use-post'
import {
  schemaCreatePostSegmentItem,
  schemaUpdatePostSegment,
} from '../../../lib/schemas'
import { trpc } from '../../../util/trpc'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { useZodForm } from '../../../util/use-zod-form'
import { ButtonRemove } from '../../Button'
import { ChoiceSelect, useChoiceSelect } from '../../ChoiceSelect'
import { EditOverlay } from '../../EditOverlay'
import { Form, Input, useIsSubmitEnabled } from '../../form'
import { IconArrowCircleDown, IconArrowCircleRight } from '../../Icon'
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
  isEditModeExternal = false,
  isPostEditable = false,
  onInitialEdit,
}: {
  postSegmentId: string
  segment: SegmentPostPage
  index: number
  postId: string
  authorId: string
  isEditModeExternal: boolean
  isPostEditable: boolean
  onInitialEdit: () => void
}): JSX.Element {
  const { deletePostSegment } = usePost(postId)

  const utils = trpc.useContext()

  async function invalidate() {
    await utils.postSegments.byPostId.invalidate({ postId })
  }

  const updateMany = trpc.postSegments.edit.useMutation({
    onSuccess: invalidate,
  })
  const createItem = trpc.postSegments.createItem.useMutation({
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

  const [isSegmentEditMode, setIsSegmentEditMode] = useState(isEditModeExternal)
  useEffect(
    () => setIsSegmentEditMode(isEditModeExternal),
    [isEditModeExternal]
  )

  const refSegmentEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refSegmentEdit, () =>
    setIsSegmentEditMode(isEditModeExternal)
  )

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
    isLoading: updateMany.isLoading,
    formState: formStateUpdate,
  })

  return (
    // items-stretch needed for the post image
    <div
      ref={refSegmentEdit}
      className="flex w-full flex-col items-stretch rounded-xl bg-white p-8 shadow-2xl lg:flex-row"
    >
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
          <div className="rounded-xl">
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
                      validationErrorMessage={
                        formStateUpdate.errors.title?.message
                      }
                    />
                    <Input
                      {...registerUpdate('subtitle')}
                      placeholder="Enter a subtitle.."
                      defaultValue={defaultValuesUpdate.subtitle}
                      validationErrorMessage={
                        formStateUpdate.errors.subtitle?.message
                      }
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
