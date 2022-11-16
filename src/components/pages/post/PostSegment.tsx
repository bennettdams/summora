import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import {
  schemaCreatePostSegmentItem,
  schemaUpdatePostSegment,
} from '../../../lib/schemas'
import { formatDateTime } from '../../../util/date-time'
import { trpc } from '../../../util/trpc'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { useZodForm } from '../../../util/use-zod-form'
import { Box } from '../../Box'
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

const defaultValuesCreate = { content: '' }

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
  const [isNewSegmentItem] = useState(() => !segment.title)

  const utils = trpc.useContext()

  function createSuccessfulEditStatus() {
    setLastSuccessfulEdit(new Date())
  }

  async function invalidate() {
    await utils.postSegments.byPostId.invalidate({ postId })
    await utils.userPosts.byUserId.invalidate({ userId: authorId })
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
    defaultValues: defaultValuesCreate,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const isSubmitCreateItemEnabled = useIsSubmitEnabled({
    isInitiallySubmittable: true,
    isLoading: createItem.isLoading,
    formState: formStateCreateItem,
  })

  const [isSegmentEditMode, setIsSegmentEditMode] = useState(
    // segments without a title should be considered "new" and are shown in edit mode initially
    () => isNewSegmentItem
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

  const defaultValuesUpdate: SchemaUpdateSegment = useMemo(
    () => ({
      postSegmentId: segment.id,
      title: segment.title,
      subtitle: segment.subtitle ?? undefined,
    }),
    [segment.id, segment.title, segment.subtitle]
  )

  const {
    handleSubmit: handleSubmitUpdate,
    register: registerUpdate,
    formState: formStateUpdate,
  } = useZodForm({
    schema: schemaUpdatePostSegment,
    defaultValues: defaultValuesUpdate,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    // new segments should be able to submit initially, as they don't have any data yet
    isInitiallySubmittable: !!isNewSegmentItem ?? false,
    isLoading: edit.isLoading,
    formState: formStateUpdate,
  })

  return (
    <Box>
      <div
        ref={refSegmentEdit}
        // items-stretch needed for the post image
        className="flex w-full flex-col items-stretch rounded-xl bg-white lg:flex-row"
      >
        <div
          className={`px-4 ${
            choiceControl.selected.choiceId === 'right'
              ? // keep width in sync with post segment image
                'w-full lg:w-4/5'
              : 'w-full'
          }`}
        >
          {/* HEADER & ITEMS */}
          <EditOverlay
            isEnabled={isPostEditable && !isSegmentEditMode}
            onClick={() => setIsSegmentEditMode(true)}
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
                  }
                })}
              >
                <div className="flex w-full flex-row text-xl">
                  <div className="h-full w-10 text-left md:w-20">
                    <span className="text-4xl italic">{sequenceNumber}</span>
                  </div>

                  {/* SEGMENT HEADER */}
                  {/*
                   * We use conditional CSS instead of conditional rendering so the children are not re-/mounted.
                   * This is e.g. needed because there is bug in React where unmounting does not trigger `onBlur`.
                   * See: https://github.com/facebook/react/issues/12363
                   */}
                  <div
                    className={`grow space-y-6 ${
                      isSegmentEditMode ? 'block' : 'hidden'
                    }`}
                  >
                    <div>
                      <FormLabel>Title</FormLabel>
                      <Input
                        {...registerUpdate('title')}
                        hasLabel
                        blurOnEnterPressed
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
                        hasLabel
                        blurOnEnterPressed
                        placeholder="Enter a subtitle.."
                        defaultValue={defaultValuesUpdate.subtitle}
                        validationErrorMessage={
                          formStateUpdate.errors.subtitle?.message
                        }
                      />
                    </div>
                  </div>

                  <div
                    className={`flex grow ${
                      isSegmentEditMode ? 'hidden' : 'block'
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
          <div className={isSegmentEditMode ? 'block' : 'hidden'}>
            <p className="my-6 text-center text-xl text-dlila">
              <span>Add a new item:</span>
            </p>

            <Form
              onBlur={handleSubmitCreateItem((data) => {
                // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
                if (isSubmitCreateItemEnabled) {
                  createItem.mutate(
                    {
                      segmentId: postSegmentId,
                      content: data.content,
                    },
                    { onSuccess: () => resetCreateItem() }
                  )
                }
              })}
              className="my-4 flex w-full items-center space-x-4"
            >
              <div className="grow">
                <Input
                  {...registerCreateItem('content')}
                  placeholder="Enter some text.."
                  blurOnEnterPressed
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
                  <p className="animate-fade-in">
                    <span>Saved changes</span>
                    <span className="ml-2 text-gray-400">
                      {formatDateTime(lastSuccessfulEdit, 'MM-DD hh:mm:ss')}
                    </span>
                  </p>
                )}
              </p>
            </div>
          </div>

          {/* POST IMAGE - BOTTOM */}
          <div
            className={
              'grid w-full place-items-center' +
              // placeholder doesn't need to be as big as an image
              ` ${segment.imageId ? 'min-h-[250px]' : 'min-h-[100px]'}` +
              // on mobile, we always show the image at the bottom, so we hide it here on larger screens if necessary
              ` ${choiceControl.selected.choiceId !== 'bottom' && 'lg:hidden'}`
            }
          >
            <PostSegmentImage
              isEditable={isPostEditable}
              postId={postId}
              authorId={authorId}
              postSegmentId={postSegmentId}
              imageId={segment.imageId}
            />
          </div>

          {isPostEditable && (
            <div className="mt-4 flex flex-col items-center space-y-4 lg:flex-row-reverse lg:items-end lg:justify-between lg:space-y-0">
              <div className="text-center">
                <p>Image position:</p>
                <p className="text-sm italic">(only on larger screens)</p>
              </div>

              <ChoiceSelect control={choiceControl} />

              <div>
                <ButtonRemove
                  showLoading={deleteSegment.isLoading}
                  onClick={() =>
                    deleteSegment.mutate({ segmentId: postSegmentId })
                  }
                >
                  Remove segment
                </ButtonRemove>
              </div>
            </div>
          )}
        </div>

        {/* POST IMAGE - RIGHT */}
        {/* the parent container uses "items-stretch" so the image can "fill" the height */}
        <div className="hidden min-h-[150px] w-full place-items-center lg:grid lg:w-1/5">
          {choiceControl.selected.choiceId === 'right' && (
            <PostSegmentImage
              isEditable={isPostEditable}
              postId={postId}
              authorId={authorId}
              postSegmentId={postSegmentId}
              imageId={segment.imageId}
            />
          )}
        </div>
      </div>
    </Box>
  )
}
