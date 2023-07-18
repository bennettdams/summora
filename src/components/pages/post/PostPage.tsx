import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Popover, Transition } from '@headlessui/react'
import type { PostCategoryId } from '@prisma/client'
import { useRouter } from 'next/router'
import { Fragment, MutableRefObject, useMemo, useRef, useState } from 'react'
import { useFormState } from 'react-hook-form'
import { z } from 'zod'
import {
  schemaUpdatePost,
  schemaUpdatePostCategory,
  schemaUpdatePostSourceURL,
} from '../../../lib/schemas'
import { PostPageProps } from '../../../pages/post/[postId]'
import { useAuth } from '../../../services/auth-service'
import { ROUTES } from '../../../services/routing'
import { RouterOutput, trpc } from '../../../util/trpc'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { useZodForm } from '../../../util/use-zod-form'
import { Avatar } from '../../Avatar'
import { ButtonAdd, ButtonRemove } from '../../Button'
import { CommentsIcon } from '../../CommentsIcon'
import { DateTime } from '../../DateTime'
import { EditOverlay } from '../../EditOverlay'
import { IconCategory, IconDate, IconSource } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { Page, PageSection } from '../../Page'
import { StepList } from '../../StepList'
import { ViewsIcon } from '../../ViewsIcon'
import { DonateButton } from '../../donation'
import {
  Form,
  FormLabel,
  FormSelect,
  Input,
  useIsSubmitEnabled,
} from '../../form'
import { Link, LinkExternal } from '../../link'
import { PostLikes } from '../../post-reusable'
import { TagsList, TagsSelection } from '../../tag'
import { NoContent, Title } from '../../typography'
import { PostSegment } from './PostSegment'
import { PostComments, PostCreateComment } from './post-comments'

export type SegmentPostPage = RouterOutput['postSegments']['byPostId'][number]

type SchemaUpdate = z.input<typeof schemaUpdatePost>
type SchemaUpdateCategory = z.input<typeof schemaUpdatePostCategory>

type PostPostPage = Exclude<RouterOutput['posts']['byPostId'], null>

export function PostPage(props: PostPageProps): JSX.Element {
  const { data: post, isLoading: isLoadingPost } = trpc.posts.byPostId.useQuery(
    {
      postId: props.postId,
    }
  )
  const { userIdAuth } = useAuth()

  return (
    <Page>
      {isLoadingPost ? (
        <div className="grid place-items-center">
          <LoadingAnimation />
        </div>
      ) : !post ? (
        <NoContent>No post.</NoContent>
      ) : (
        <PostPageInternal
          post={post}
          postId={props.postId}
          userId={userIdAuth}
        />
      )}
    </Page>
  )
}

function PostPageInternal({
  postId,
  post,
  userId,
}: PostPageProps & {
  // exclude null - this should be checked in the parent to allow easier hooks usage in this component
  post: PostPostPage
  userId: string | null
}): JSX.Element {
  const { data: segments, isLoading: isLoadingSegments } =
    trpc.postSegments.byPostId.useQuery({
      postId,
    })

  const utils = trpc.useContext()

  async function invalidateSegments() {
    await utils.postSegments.byPostId.invalidate({ postId })
  }

  const isPostEditable = userId === post.authorId

  const createSegment = trpc.posts.createSegment.useMutation({
    onSuccess: invalidateSegments,
  })

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  return (
    <>
      {/* POST HEADER */}
      <PostHeader
        userId={userId}
        authorId={post.authorId}
        postId={postId}
        isPostEditable={isPostEditable}
        title={post.title}
        subtitle={post.subtitle}
      />

      {/* META */}
      <PostMeta
        postId={postId}
        userId={userId}
        post={post}
        isPostEditable={isPostEditable}
      />

      {/* SEGMENTS & STEP LIST */}
      <PageSection hideTopMargin>
        {/* "items-start" to make "sticky" work. Without it, the sticky div has the full height of the flex container. */}
        <div className="mt-14 w-full items-start lg:flex">
          {isLoadingSegments ? (
            <div className="grid w-full place-items-center">
              <LoadingAnimation />
            </div>
          ) : !segments || segments.length === 0 ? (
            <div className="grid w-full place-items-center">
              <NoContent>No post segments.</NoContent>
            </div>
          ) : (
            <>
              {/* STEP LIST */}
              <div className="top-40 ml-0 md:ml-10 lg:sticky lg:ml-0 lg:block lg:w-1/6 lg:pr-8">
                <StepList
                  steps={segments.map((segment, index) => ({
                    no: index,
                    title: segment.title,
                    subtitle: segment.subtitle,
                  }))}
                />
              </div>

              {/* POST SEGMENTS */}
              <div ref={animateRef} className="space-y-16 lg:w-4/6">
                {segments.map((segment, index) => (
                  <PostSegment
                    postSegmentId={segment.id}
                    sequenceNumber={index + 1}
                    isLastInSequence={index === segments.length - 1}
                    postId={postId}
                    authorId={post.authorId}
                    key={segment.id}
                    segment={segment}
                    isPostEditable={isPostEditable}
                  />
                ))}
              </div>

              <div className="lg:w-1/6">&nbsp;</div>
            </>
          )}
        </div>
      </PageSection>

      {isPostEditable && (
        <PageSection>
          <div className="my-20 grid place-items-center">
            <ButtonAdd
              isBig
              showLoading={createSegment.isLoading}
              onClick={() => createSegment.mutate({ postId })}
            >
              Add segment
            </ButtonAdd>
          </div>
        </PageSection>
      )}

      <PageSection label="Comments">
        <div className="mx-auto w-2/3">
          <PostCreateComment postId={postId} />
        </div>
      </PageSection>

      <PageSection>
        <PostComments postId={postId} userId={userId} />
      </PageSection>
    </>
  )
}

function PostHeader({
  isPostEditable,
  userId,
  postId,
  authorId,
  title,
  subtitle,
}: {
  isPostEditable: boolean
  userId: string | null
  postId: string
  authorId: string
  title: string
  subtitle: string | null
}): JSX.Element {
  const utils = trpc.useContext()

  const [isPostHeaderEditMode, setIsPostHeaderEditMode] = useState(false)
  const refPostHeaderEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refPostHeaderEdit, () => setIsPostHeaderEditMode(false))

  const edit = trpc.posts.edit.useMutation({
    onSuccess: async () => {
      await utils.posts.byPostId.invalidate({ postId })
      await utils.posts.someByUserId.invalidate({ userId: authorId })
    },
  })

  const defaultValuesUpdate: SchemaUpdate = useMemo(
    () => ({
      postId,
      title,
      subtitle: subtitle ?? undefined,
    }),
    [postId, title, subtitle]
  )

  const {
    handleSubmit: handleSubmitUpdate,
    register: registerUpdate,
    control: controlUpdate,
  } = useZodForm({
    schema: schemaUpdatePost,
    defaultValues: defaultValuesUpdate,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })
  const { errors: errorsUpdate } = useFormState({ control: controlUpdate })

  const isSubmitEnabled = useIsSubmitEnabled({
    isLoading: edit.isLoading,
    control: controlUpdate,
  })

  return (
    <div className="w-full text-center">
      <EditOverlay
        isEnabled={isPostEditable && !isPostHeaderEditMode}
        onClick={() => setIsPostHeaderEditMode(true)}
      >
        <Form
          className="mx-auto mb-10 w-full space-y-4"
          onBlur={handleSubmitUpdate((data) => {
            // For `onBlur`, RHF does not validate like with `onSubmit`, so we check ourselves.
            if (isSubmitEnabled) {
              edit.mutate({
                postId,
                title: data.title,
                subtitle: data.subtitle,
              })
            }
          })}
        >
          <div className="flex w-full flex-row text-xl">
            {/*
             * We use conditional CSS instead of conditional rendering so the children are not re-/mounted.
             * This is e.g. needed because there is bug in React where unmounting does not trigger `onBlur`.
             * See: https://github.com/facebook/react/issues/12363
             */}
            <div
              className={`mx-auto space-y-6 lg:w-1/2 ${
                isPostHeaderEditMode ? 'block' : 'hidden'
              }`}
              ref={refPostHeaderEdit}
            >
              <div>
                <FormLabel>Title</FormLabel>
                <Input
                  {...registerUpdate('title')}
                  hasLabel
                  blurOnEnterPressed
                  placeholder="Enter a title.."
                  autoFocus={!defaultValuesUpdate.title}
                  defaultValue={defaultValuesUpdate.title}
                  validationErrorMessage={errorsUpdate.title?.message}
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
                  validationErrorMessage={errorsUpdate.subtitle?.message}
                />
              </div>
            </div>

            <div
              className={`relative flex grow flex-col justify-center p-4 ${
                isPostHeaderEditMode ? 'hidden' : 'block'
              }`}
            >
              {/* LIKES */}
              <div className="absolute right-0 z-10 hidden h-full place-items-center md:mr-14 lg:grid">
                <PostLikes iconSize="huge" postId={postId} userId={userId} />
              </div>

              {/* POST TITLE */}
              <div>
                <p className="mx-0 font-serif text-3xl font-semibold leading-7 text-dprimary md:mx-20 md:text-4xl">
                  {title}
                </p>
              </div>

              <div className="flex-1">
                <span className="italic text-dsecondary">{subtitle}</span>
              </div>
            </div>
          </div>
        </Form>
      </EditOverlay>
    </div>
  )
}

function PostMeta({
  postId,
  userId,
  isPostEditable,
  post,
}: {
  postId: string
  userId: string | null
  isPostEditable: boolean
  post: PostPostPage
}) {
  const router = useRouter()
  const utils = trpc.useContext()

  const deletePost = trpc.posts.delete.useMutation()

  // CATEGORY
  const [isShownCategoryDropdown, setIsShownCategoryDropdown] = useState(false)
  const [refCategory] = useHover<HTMLDivElement>(() =>
    setIsShownCategoryDropdown(true)
  )
  useOnClickOutside(refCategory, () => setIsShownCategoryDropdown(false))

  // TAGS
  const { data: tags, isLoading: isLoadingTags } =
    trpc.postTags.byPostId.useQuery({
      postId,
    })

  async function invalidateTags() {
    await utils.postTags.byPostId.invalidate({ postId })
  }
  const addToPost = trpc.postTags.addToPost.useMutation({
    onSuccess: invalidateTags,
  })
  const removeFromPost = trpc.postTags.removeFromPost.useMutation({
    onSuccess: invalidateTags,
  })

  const [isShownTagSelection, setIsShownTagSelection] = useState(false)

  async function handleRemoveTag(tagId: string): Promise<void> {
    removeFromPost.mutate({ postId, tagId })
  }

  return (
    <PageSection hideTopMargin>
      <div className="relative grid grid-cols-5 place-items-center gap-2 lg:gap-0">
        {/* LIKES */}
        {/* Negative margin to push the button up. */}
        <div className="absolute right-0 top-0 -mt-10 lg:hidden">
          <PostLikes iconSize="huge" postId={postId} userId={userId} />
        </div>

        {/* CATEGORY */}
        <div className="col-span-5 flex h-10 w-full items-center justify-center lg:col-span-1 lg:justify-end lg:pr-2">
          <CategorySelect
            postId={postId}
            categoryIdInitial={post.postCategoryId}
            shouldShowDropdown={isPostEditable && isShownCategoryDropdown}
            refExternal={refCategory}
          />
        </div>

        {/* META INFO */}
        <div className="col-span-5 flex w-full items-center justify-center gap-2 lg:col-span-2 lg:justify-start lg:gap-6 lg:pl-2">
          <ViewsIcon noOfViews={post.noOfViews} />
          <CommentsIcon noOfComments={post._count.comments} />

          <div className="inline-flex items-center text-sm">
            <div className="min-w-0">
              <IconDate size="small" />
            </div>
            <span className="ml-1">
              <DateTime
                format="MM-DD hh:mm"
                title="Created at"
                date={post.createdAt}
              />
            </span>
          </div>

          <SourceURLPopover
            postId={postId}
            sourceURL={post.sourceURL}
            isPostEditable={isPostEditable}
          />
        </div>

        {/* DONATE */}
        <div className="col-span-3 lg:col-span-1 lg:flex lg:w-full lg:justify-end">
          <DonateButton
            userId={post.authorId}
            username={post.author.username}
          />
        </div>

        {/* AVATAR */}
        <div className="col-span-2 col-start-4 lg:col-span-1">
          <Link to={ROUTES.user(post.authorId)}>
            <div className="flex flex-col items-center justify-center rounded-xl px-10 py-2 duration-200 hover:bg-white hover:transition-colors hover:ease-in-out">
              <Avatar
                userId={post.authorId}
                username={post.author.username}
                imageId={post.author.imageId}
                imageBlurDataURL={post.author.imageBlurDataURL}
                imageFileExtension={post.author.imageFileExtension}
                size="medium"
              />
            </div>
          </Link>
        </div>

        {/* USERNAME */}
        <div className="col-span-2 col-start-4 max-w-full lg:col-span-1 lg:col-start-5">
          <h2 className="truncate text-lg font-semibold leading-none text-dprimary">
            {post.author.username}
          </h2>
        </div>

        {/* TAGS */}
        <div className="col-span-5 mt-6 lg:col-span-3 lg:col-start-2">
          {isLoadingTags ? (
            <LoadingAnimation />
          ) : (
            <TagsList
              tags={tags ?? null}
              onAddButtonClick={() => setIsShownTagSelection(true)}
              onRemoveClick={
                !isPostEditable
                  ? undefined
                  : (tagIdToRemove) => handleRemoveTag(tagIdToRemove)
              }
              showAddButton={isPostEditable && !isShownTagSelection}
            />
          )}
        </div>

        {/* DELETE POST */}
        {isPostEditable && (
          <div className="col-span-5 mt-6 flex items-center text-sm lg:col-span-1 lg:col-start-5">
            <ButtonRemove
              showLoading={deletePost.isLoading}
              onClick={() => {
                deletePost.mutate(
                  { postId },
                  { onSuccess: () => router.push(ROUTES.home) }
                )
              }}
              variant="secondary"
            >
              Delete post
            </ButtonRemove>
          </div>
        )}

        <div className="col-span-5 mt-6 space-y-6 text-center">
          {isShownTagSelection && (
            <>
              <Title>Select or create a tag</Title>
              <TagsSelection
                showCreateButton={true}
                postId={postId}
                onAdd={(tag) => addToPost.mutate({ postId, tagId: tag.tagId })}
                onOutsideClick={() => setIsShownTagSelection(false)}
                postCategoryId={post.postCategoryId}
                tagsExisting={tags ?? []}
              />
            </>
          )}
        </div>
      </div>
    </PageSection>
  )
}

function SourceURLPopover({
  postId,
  isPostEditable,
  sourceURL,
}: {
  postId: string
  isPostEditable: boolean
  sourceURL: string | null
}): JSX.Element {
  const utils = trpc.useContext()

  const updateSourceURL = trpc.posts.editSourceURL.useMutation()

  function invalidate() {
    utils.posts.invalidate()
  }

  const {
    handleSubmit,
    register,
    control,
    formState: {
      errors: { sourceURL: errorSourceURL },
    },
  } = useZodForm({
    schema: schemaUpdatePostSourceURL,
    shouldFocusError: false,
    values: {
      postId,
      sourceURL,
    },
    mode: 'onChange',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    control,
    isLoading: false,
  })

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            className={`group inline-flex items-center border-none text-sm hover:text-opacity-100 focus-visible:outline-none ${
              open ? '' : 'text-opacity-90'
            } ${
              sourceURL || isPostEditable ? 'cursor-pointer' : 'cursor-auto'
            }`}
          >
            {/* min-w-0 so the icon is not squeezed */}
            <div className="min-w-0">
              <IconSource size="small" />
            </div>

            <div className={`ml-1 ${sourceURL && 'hover:underline'}`}>
              <span>
                {isPostEditable
                  ? !sourceURL
                    ? 'Add a source'
                    : 'Edit source'
                  : !sourceURL
                  ? 'No source'
                  : 'Show source'}
              </span>
            </div>
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-20 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-xl">
              <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative p-4 lg:p-8">
                  {isPostEditable ? (
                    <Form
                      onBlur={handleSubmit((formData) => {
                        if (isSubmitEnabled) {
                          updateSourceURL.mutate(
                            { postId, sourceURL: formData.sourceURL },
                            {
                              onSuccess: () => {
                                invalidate()
                              },
                            }
                          )
                        }
                      })}
                    >
                      <Input
                        {...register('sourceURL')}
                        placeholder="What is the source for your post?"
                        validationErrorMessage={errorSourceURL?.message}
                        textAlignCenter={true}
                        hideBottomBorderForSpecial={true}
                        blurOnEnterPressed={true}
                      />
                    </Form>
                  ) : sourceURL ? (
                    <LinkExternal to={sourceURL}>
                      <p className="break-words text-center underline hover:text-dprimary">
                        {sourceURL}
                      </p>
                    </LinkExternal>
                  ) : (
                    <p className="text-center">No source.</p>
                  )}

                  {isPostEditable && (
                    <div className="mt-8">
                      <ButtonRemove
                        disabled={!sourceURL}
                        onClick={() =>
                          updateSourceURL.mutate(
                            { postId, sourceURL: null },
                            { onSuccess: () => invalidate() }
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="bg-dlight p-4">
                  <p className="font-medium text-sm">
                    {!isPostEditable && 'Check the link before clicking!'}
                  </p>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

function CategorySelect({
  postId,
  categoryIdInitial,
  shouldShowDropdown,
  refExternal,
}: {
  postId: string
  categoryIdInitial: PostCategoryId
  shouldShowDropdown: boolean
  refExternal: MutableRefObject<HTMLDivElement>
}): JSX.Element {
  const utils = trpc.useContext()
  const { data: postCategories, isLoading: isLoadingCategories } =
    trpc.postCategories.all.useQuery()
  const updateCategory = trpc.posts.editCategory.useMutation({
    onSuccess: () => utils.posts.byPostId.invalidate(),
  })

  const defaultValues: SchemaUpdateCategory = useMemo(
    () => ({
      postId,
      categoryId: categoryIdInitial,
    }),
    [postId, categoryIdInitial]
  )

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useZodForm({
    schema: schemaUpdatePostCategory,
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onBlur',
  })

  return (
    <div className="flex items-center justify-center text-sm" ref={refExternal}>
      {isLoadingCategories ? (
        <LoadingAnimation />
      ) : !postCategories ? (
        <NoContent>No categories.</NoContent>
      ) : shouldShowDropdown ? (
        <Form
          onChange={handleSubmit((data) => {
            updateCategory.mutate({ postId, categoryId: data.categoryId })
          })}
        >
          <FormSelect
            control={control}
            name="categoryId"
            items={postCategories.map((category) => ({
              itemId: category.id,
              label: category.name,
            }))}
            validationErrorMessage={errors.categoryId?.message}
            unselectedLabel="Please select a category."
          />
        </Form>
      ) : (
        <div className="flex items-center text-sm">
          <IconCategory />

          <span className="ml-2 py-1.5">
            {!categoryIdInitial
              ? 'Please select a category'
              : postCategories.find(
                  (category) => category.id === categoryIdInitial
                )?.name ?? 'No category'}
          </span>
        </div>
      )}
    </div>
  )
}
