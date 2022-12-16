import { useAutoAnimate } from '@formkit/auto-animate/react'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useFormState } from 'react-hook-form'
import { z } from 'zod'
import {
  schemaCreatePostComment,
  schemaTagSearch,
  schemaUpdatePost,
  schemaUpdatePostCategory,
} from '../../../lib/schemas'
import { PostPageProps } from '../../../pages/post/[postId]'
import { useAuth } from '../../../services/auth-service'
import { ROUTES } from '../../../services/routing'
import { RouterOutput, trpc } from '../../../util/trpc'
import { useDebounce } from '../../../util/use-debounce'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { useZodForm } from '../../../util/use-zod-form'
import { Avatar } from '../../Avatar'
import { Box } from '../../Box'
import { ButtonAdd } from '../../Button'
import { CommentsIcon } from '../../CommentsIcon'
import { DateTime } from '../../DateTime'
import { DonateButton } from '../../donation'
import { EditOverlay } from '../../EditOverlay'
import {
  Form,
  FormFieldError,
  FormLabel,
  FormSelect,
  Input,
  useIsSubmitEnabled,
} from '../../form'
import { IconCategory, IconDate, IconReply, IconTrash } from '../../Icon'
import { Link } from '../../link'
import { LoadingAnimation } from '../../LoadingAnimation'
import { NoContent } from '../../NoContent'
import { Page, PageSection } from '../../Page'
import { PostLikes } from '../../post'
import { StepList } from '../../StepList'
import { Tag, TagsList } from '../../tag'
import { ViewsIcon } from '../../ViewsIcon'
import { VoteIcon } from '../../VoteIcon'
import { PostSegment } from './PostSegment'

export type SegmentPostPage = RouterOutput['postSegments']['byPostId'][number]
export type SegmentItemPostPage = SegmentPostPage['items'][number]
type TagPostPage = RouterOutput['postTags']['byPostId'][number]

type SchemaUpdate = z.infer<typeof schemaUpdatePost>
type SchemaUpdateCategory = z.infer<typeof schemaUpdatePostCategory>
type SchemaCreateComment = z.infer<typeof schemaCreatePostComment>
type SchemaTagSearch = z.infer<typeof schemaTagSearch>

export function PostPage(props: PostPageProps): JSX.Element {
  const { data: post, isLoading: isLoadingPost } = trpc.posts.byPostId.useQuery(
    {
      postId: props.postId,
    }
  )
  const { userIdAuth } = useAuth()

  const { refetch } = trpc.posts.incrementViews.useQuery(
    { postId: props.postId },
    { enabled: false }
  )
  const [hasViewsBeenIncremented, setHasViewBeenIncremented] = useState(false)
  useEffect(() => {
    if (!hasViewsBeenIncremented) {
      setHasViewBeenIncremented(true)
      refetch()
    }
  }, [hasViewsBeenIncremented, props.postId, refetch])

  return (
    <Page>
      {isLoadingPost ? (
        <div className="grid place-items-center">
          <LoadingAnimation />
        </div>
      ) : !post ? (
        <NoContent>No post</NoContent>
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

function useCreateComment(postId: string) {
  const utils = trpc.useContext()
  async function invalidateComments() {
    await utils.postComments.byPostId.invalidate({ postId })
  }

  return trpc.postComments.create.useMutation({
    onSuccess: invalidateComments,
  })
}

function PostPageInternal<
  // exclude null - this should be checked in the parent to allow easier hooks usage in this component
  TPostType extends Exclude<RouterOutput['posts']['byPostId'], null>
>({
  postId,
  post,
  userId,
}: PostPageProps & {
  post: TPostType
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

  const createComment = useCreateComment(postId)

  const [isPostEditable, setIsPostEditable] = useState(userId === post.authorId)
  useEffect(
    () => setIsPostEditable(userId === post.authorId),
    [userId, post.authorId]
  )

  const createSegment = trpc.posts.createSegment.useMutation({
    onSuccess: invalidateSegments,
  })

  // CATEGORY
  const [isShownCategoryDropdown, setIsShownCategoryDropdown] = useState(false)
  const [refCategory] = useHover<HTMLDivElement>(() =>
    setIsShownCategoryDropdown(true)
  )
  useOnClickOutside(refCategory, () => setIsShownCategoryDropdown(false))

  // POST HEADER
  const [isPostHeaderEditMode, setIsPostHeaderEditMode] = useState(false)
  const refPostHeaderEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refPostHeaderEdit, () => setIsPostHeaderEditMode(false))

  const edit = trpc.posts.edit.useMutation({
    onSuccess: async () => {
      await utils.posts.byPostId.invalidate({ postId })
      await utils.posts.someByUserId.invalidate({ userId: post.authorId })
    },
  })

  const defaultValuesUpdate: SchemaUpdate = useMemo(
    () => ({
      postId,
      title: post.title,
      subtitle: post.subtitle ?? undefined,
    }),
    [postId, post.title, post.subtitle]
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

  const { data: tagsPopular, isLoading: isLoadingTagsPopular } =
    trpc.postTags.popularOverall.useQuery()
  const {
    data: tagsPopularByCategory,
    isLoading: isLoadingTagsPopularByCategory,
  } = trpc.postTags.popularByCategoryId.useQuery({
    categoryId: post.postCategoryId,
  })

  const defaultValuesTagSearch: SchemaTagSearch = useMemo(
    () => ({ searchInput: '' }),
    []
  )
  const {
    handleSubmit: handleSubmitTagSearch,
    register: registerTagSearchTagSearch,
    watch: watchTagSearch,
  } = useZodForm({
    schema: schemaTagSearch,
    defaultValues: defaultValuesTagSearch,
    mode: 'onSubmit',
  })

  const inputTagSearch = watchTagSearch('searchInput')

  const [isShownTagSelection, setIsShownTagSelection] = useState(false)
  const refTagSelection = useRef<HTMLDivElement>(null)
  useOnClickOutside(refTagSelection, () => setIsShownTagSelection(false))

  async function handleRemoveTag(tagId: string): Promise<void> {
    removeFromPost.mutate({ postId, tagId })
  }
  const inputTagSearchDebounced = useDebounce(inputTagSearch, 500)
  const { data: tagsSearchResult, isFetching } = trpc.postTags.search.useQuery(
    { searchInput: inputTagSearchDebounced },
    {
      enabled: !!inputTagSearchDebounced && inputTagSearchDebounced.length >= 2,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

  async function handleAddTag(tagId: string): Promise<void> {
    addToPost.mutate({ postId, tagId })
  }

  /**
   * Removes tags which are already included in a post from a list of tags.
   */
  function filterTags(tagsToFilter: TagPostPage[]): TagPostPage[] {
    return !tags
      ? tagsToFilter
      : tagsToFilter.filter(
          (tagToFilter) => !tags.some((tag) => tag.tagId === tagToFilter.tagId)
        )
  }

  // COMMENTS
  const defaultValuesCreateComment: SchemaCreateComment = useMemo(
    () => ({ postId, commentParentId: null, text: '' }),
    [postId]
  )
  const {
    handleSubmit: handleSubmitCreateComment,
    register: registerCreateComment,
    formState: {
      errors: { text: errorText },
    },
    reset: resetCreateComment,
  } = useZodForm({
    schema: schemaCreatePostComment,
    defaultValues: defaultValuesCreateComment,
    mode: 'onSubmit',
  })

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  return (
    <>
      {/* POST HEADER */}
      <PageSection hideTopMargin>
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
                    <PostLikes
                      iconSize="huge"
                      postId={postId}
                      userId={userId}
                    />
                  </div>

                  {/* POST TITLE */}
                  <div>
                    <h2 className="font-bold text-2xl leading-7 sm:text-3xl">
                      <span className="text-dprimary">{post.title}</span>
                    </h2>
                  </div>

                  <div className="flex-1">
                    <span className="italic text-dsecondary">
                      {post.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            </Form>
          </EditOverlay>
        </div>
      </PageSection>

      {/* META */}
      <PageSection hideTopMargin>
        <div className="flex w-full flex-col justify-between lg:flex-row">
          {/* LEFT JUSTIFY */}
          {/* margin bottom to align the row vertically with the avatar image */}
          <div className="mb-10 flex flex-row items-center">
            <div className="flex w-2/3 flex-col items-start justify-center pl-10 md:w-3/4 md:flex-row md:flex-wrap md:items-center md:space-x-6 md:pl-0 lg:relative lg:w-full">
              {/* CATEGORY */}
              <CategorySelect
                postId={postId}
                categoryIdInitial={post.postCategoryId}
                shouldShowDropdown={isPostEditable && isShownCategoryDropdown}
                refExternal={refCategory}
              />

              {/* META INFO */}
              <div className="flex items-center text-sm">
                <ViewsIcon noOfViews={post.noOfViews} />
              </div>

              <div className="flex items-center text-sm">
                <CommentsIcon noOfComments={post._count.comments} />
              </div>

              <div className="flex items-center text-sm">
                <IconDate />
                <span className="ml-1">
                  <DateTime format="MM-DD hh:mm" date={post.createdAt} />
                </span>
              </div>
            </div>

            <div className="z-10 grid h-full w-1/3 place-items-center md:w-1/4 lg:absolute lg:right-0 lg:mr-14 lg:hidden">
              <PostLikes iconSize="huge" postId={postId} userId={userId} />
            </div>
          </div>

          {/* RIGHT JUSTIFY */}
          <div className="flex flex-row items-center justify-center">
            {/* DONATION */}
            {/* margin bottom to align the row vertically with the avatar image */}
            <div className="mb-10 md:mr-4">
              <DonateButton userId={post.authorId} />
            </div>

            {/* AVATAR */}
            <Link to={ROUTES.user(post.authorId)}>
              <div className="flex flex-col items-center justify-center rounded-xl py-2 px-10 duration-200 hover:bg-white hover:transition-colors hover:ease-in-out">
                <Avatar
                  userId={post.authorId}
                  username={post.author.username}
                  imageId={post.author.imageId}
                  imageBlurDataURL={post.author.imageBlurDataURL}
                  size="medium"
                />

                <div className="mt-4 flex flex-col items-center justify-center text-center">
                  <h2 className="text-lg font-semibold leading-none text-dprimary">
                    {post.author.username}
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </PageSection>

      {/* TAGS */}
      <PageSection hideTopMargin>
        {isLoadingTags ? (
          <LoadingAnimation />
        ) : (
          <TagsList
            tags={tags ?? null}
            onAddButtonClick={() => setIsShownTagSelection(true)}
            onRemoveClick={(tagIdToRemove) => handleRemoveTag(tagIdToRemove)}
            showAddButton={isPostEditable && !isShownTagSelection}
          />
        )}
      </PageSection>

      {/* TAG SELECTION */}
      {isShownTagSelection && (
        <PageSection>
          <div
            className="flex flex-col space-y-6 lg:flex-row lg:space-x-10 lg:space-y-0"
            ref={refTagSelection}
          >
            <div className="w-full flex-1">
              <Box>
                <div className="flex w-full items-center space-x-3">
                  <span className="italic">Search</span>
                  <span className="font-bold text-dprimary">
                    {inputTagSearch}
                  </span>
                </div>

                <Form
                  onSubmit={handleSubmitTagSearch(() => {
                    // noop, this is executed via debounce above
                  })}
                >
                  <Input
                    {...registerTagSearchTagSearch('searchInput')}
                    placeholder="Search for tags.."
                    isSpecial
                    isLoading={isFetching}
                    small
                  />
                </Form>

                <div className="-m-1 mt-2 flex flex-wrap">
                  {tagsSearchResult &&
                    (tagsSearchResult.length === 0 ? (
                      <NoContent>No results for your search</NoContent>
                    ) : (
                      filterTags(tagsSearchResult).map((tag) => (
                        <Tag key={tag.tagId} tag={tag} onClick={handleAddTag} />
                      ))
                    ))}
                </div>
              </Box>
            </div>

            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular overall</p>
                <div className="-m-1 mt-2 flex flex-wrap">
                  {isLoadingTagsPopular ? (
                    <LoadingAnimation />
                  ) : !tagsPopular ? (
                    <NoContent>No tags</NoContent>
                  ) : (
                    filterTags(tagsPopular).map((tag) => (
                      <Tag key={tag.tagId} tag={tag} onClick={handleAddTag} />
                    ))
                  )}
                </div>
              </Box>
            </div>

            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular for this category</p>
                <div className="-m-1 mt-2 flex flex-1 flex-wrap">
                  {isLoadingTagsPopularByCategory ? (
                    <LoadingAnimation />
                  ) : !tagsPopularByCategory ? (
                    <NoContent>No tags</NoContent>
                  ) : (
                    filterTags(tagsPopularByCategory).map((tag) => (
                      <Tag key={tag.tagId} tag={tag} onClick={handleAddTag} />
                    ))
                  )}
                </div>
              </Box>
            </div>
          </div>
        </PageSection>
      )}

      <PageSection>
        {/* "items-start" to make "sticky" work. Without it, the sticky div has the full height of the flex container. */}
        <div className="w-full items-start lg:flex">
          {isLoadingSegments ? (
            <div className="grid w-full place-items-center">
              <LoadingAnimation />
            </div>
          ) : !segments || segments.length === 0 ? (
            <div className="grid w-full place-items-center">
              <NoContent>No post segments</NoContent>
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
          <Form
            onSubmit={handleSubmitCreateComment((data) => {
              createComment.mutate(
                { postId, commentParentId: null, text: data.text },
                {
                  onSuccess: () => {
                    resetCreateComment()
                  },
                }
              )
            })}
          >
            <Input
              {...registerCreateComment('text')}
              placeholder="Enter a comment.."
              validationErrorMessage={errorText?.message}
              isSpecial
              isLoading={createComment.isLoading}
            />
          </Form>
        </div>
      </PageSection>

      <PageSection>
        <PostComments postId={postId} userId={userId} />
      </PageSection>
    </>
  )
}

function CategorySelect({
  postId,
  categoryIdInitial,
  shouldShowDropdown,
  refExternal,
}: {
  postId: string
  categoryIdInitial: string
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
        <NoContent>No categories</NoContent>
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
          <FormFieldError
            noMargin
            errors={errors}
            fieldName="general-form-error-key"
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

type PostComment = {
  commentId: string
  commentParentId: string | null
  text: string
  isDeleted: boolean
  createdAt: Date
  authorId: string
  authorUsername: string
  authorImageId: string | null
  authorImageBlurDataURL: string | null
  upvotedBy: { userId: string }[]
  downvotedBy: { userId: string }[]
}

type PostCommentTreeComment = PostComment & {
  commentChilds: PostCommentTreeComment[]
}

function Comment({
  postId,
  comment,
  isRoot = false,
  userId,
  onAdd,
  onRemove,
  onUpvote,
  onDownvote,
}: {
  postId: string
  comment: PostCommentTreeComment
  isRoot: boolean
  userId: string | null
  onAdd: ({
    commentParentId,
    text,
  }: {
    commentParentId: string
    text: string
  }) => void
  onRemove: (commentId: string) => void
  onUpvote: (commentId: string) => void
  onDownvote: (commentId: string) => void
}) {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)

  const refCommentInput = useRef<HTMLDivElement>(null)
  useOnClickOutside(refCommentInput, () => setShowCommentInput(false))

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  const defaultValues: SchemaCreateComment = useMemo(
    // this is misleading, but we use `commentId` here (instead of `commentParentId`) because we create a NEW comment "below" in the tree
    () => ({ postId, commentParentId: comment.commentId, text: '' }),
    [postId, comment.commentId]
  )
  const {
    handleSubmit,
    register,
    formState: {
      errors: { text: errorText },
    },
    reset,
  } = useZodForm({
    schema: schemaCreatePostComment,
    defaultValues: defaultValues,
    mode: 'onSubmit',
  })

  return (
    <>
      <div
        className={`space-y-1 ${isRoot ? 'rounded-xl bg-white p-10' : 'ml-14'}`}
      >
        <div className="flex w-full">
          <div className="group relative grid w-10 place-items-center">
            <p className="font-bold block text-sm tracking-tight text-dsecondary group-hover:hidden">
              {comment.upvotedBy.length - comment.downvotedBy.length}
            </p>
            <p
              title="Upvotes | Downvotes"
              className="font-bold absolute hidden w-20 text-center text-xs tracking-tight text-dtertiary group-hover:block"
            >
              {comment.upvotedBy.length} | {comment.downvotedBy.length}
            </p>
          </div>
          <div className="ml-2 grow">
            {comment.isDeleted ? (
              <span className="line-through">deleted</span>
            ) : (
              <span>{comment.text}</span>
            )}
          </div>
        </div>

        <div className="m-0 flex w-full text-sm">
          <div className="flex w-10 flex-row items-center justify-center text-center leading-none text-dtertiary">
            <VoteIcon
              size="small"
              variant="upvote"
              isVoted={comment.upvotedBy.some(
                (upvote) => upvote.userId === userId
              )}
              onClick={() => onUpvote(comment.commentId)}
            />
            <VoteIcon
              size="small"
              variant="downvote"
              isVoted={comment.downvotedBy.some(
                (downvote) => downvote.userId === userId
              )}
              onClick={() => onDownvote(comment.commentId)}
            />
          </div>
          <Link to={ROUTES.user(comment.authorId)} disablePrefetch>
            <div className="group flex">
              <div className="bold flex w-10 flex-col items-center text-center leading-none">
                <Avatar
                  size="tiny"
                  userId={comment.authorId}
                  username={comment.authorUsername}
                  imageId={comment.authorImageId}
                  imageBlurDataURL={comment.authorImageBlurDataURL}
                />
              </div>

              <div className="flex items-center space-x-2 leading-none text-dprimary group-hover:underline">
                <span className="ml-2">{comment.authorUsername}</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-2 leading-none text-gray-400">
            <span className="ml-2">
              <DateTime format="MM-DD hh:mm" date={comment.createdAt} />
            </span>
          </div>

          <div className="group ml-4 flex items-center rounded px-2 hover:cursor-pointer hover:bg-dsecondary">
            {!showCommentInput && (
              <div
                className="flex items-center"
                onClick={() => setShowCommentInput(true)}
              >
                <IconReply size="small" className="group-hover:text-white" />
                <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-dsecondary group-hover:text-white">
                  Reply
                </span>
              </div>
            )}
          </div>

          {!!userId && comment.authorId === userId && !comment.isDeleted && (
            <div className="group ml-4 flex items-center rounded px-2 hover:cursor-pointer hover:bg-dsecondary">
              {!showRemoveConfirmation ? (
                <div
                  className="flex items-center"
                  onClick={() => setShowRemoveConfirmation(true)}
                >
                  <IconTrash size="small" className="group-hover:text-white" />
                  <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-dsecondary group-hover:text-white">
                    Remove
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center"
                  onClick={() => onRemove(comment.commentId)}
                >
                  <IconTrash size="small" className="group-hover:text-white" />
                  <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-dsecondary group-hover:text-white">
                    Confirm
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!!showCommentInput && (
          <div ref={refCommentInput} className="md:w-2/3">
            <Form
              onSubmit={handleSubmit((data) => {
                onAdd({
                  /*
                   * Using `commentId` instead of `commentParentId` is confusing on first sight, but we use `commentId` here instead of `commentParentId`
                   * because we create a NEW comment "below" in the tree. Think about it like this: THIS comment (`commentId`) is the future parent of
                   * the comment we want to create right now.
                   */
                  commentParentId: comment.commentId,
                  text: data.text,
                })
                setShowCommentInput(false)
                reset()
              })}
            >
              <Input
                {...register('text')}
                placeholder="Enter a comment.."
                validationErrorMessage={errorText?.message}
                isSpecial
                isLoading={false}
                small
              />
            </Form>
          </div>
        )}

        <div ref={animateRef}>
          {comment.commentChilds.map((comment) => (
            <Comment
              postId={postId}
              key={comment.commentId}
              isRoot={false}
              comment={comment}
              userId={userId}
              onAdd={onAdd}
              onRemove={onRemove}
              onUpvote={onUpvote}
              onDownvote={onDownvote}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function createRootComments(
  comments: RouterOutput['postComments']['byPostId']
): PostCommentTreeComment[] {
  return comments.map((comm) => ({
    ...comm,
    authorId: comm.author.userId,
    authorUsername: comm.author.username,
    authorImageId: comm.author.imageId,
    authorImageBlurDataURL: comm.author.imageBlurDataURL,
    commentChilds: [],
  }))
}

/**
 * Creates a comment tree from a flat array.
 * For root level comments, use "null" as `commentId`.
 *
 * input:
 * `[1 | 1.1 | 2 | 3 | 3.1 | 3.2]`
 *
 * output:
 * `[1 [1.1] | 2 | 3 [3.1, 3.2] ]`
 */
function createCommentTree(
  comments: PostCommentTreeComment[],
  commentId: string | null
): PostCommentTreeComment[] {
  return comments
    .filter((comment) => comment.commentParentId === commentId)
    .map((comment) => ({
      ...comment,
      commentChilds: createCommentTree(comments, comment.commentId),
    }))
}

export function PostComments({
  postId,
  userId,
}: {
  postId: string
  userId: string | null
}): JSX.Element {
  const [animateRef] = useAutoAnimate<HTMLDivElement>()
  const { data: comments, isLoading } = trpc.postComments.byPostId.useQuery({
    postId,
  })

  const utils = trpc.useContext()

  function invalidateComments() {
    // TODO We could only invalidate the comment (or root comment?) instead of all comments, but we would need to fetch the comments differently for that
    utils.postComments.byPostId.invalidate({ postId })
  }

  const createComment = useCreateComment(postId)
  const upvote = trpc.postComments.upvote.useMutation({
    onSuccess: invalidateComments,
  })
  const downvote = trpc.postComments.downvote.useMutation({
    onSuccess: invalidateComments,
  })
  const deleteOne = trpc.postComments.delete.useMutation({
    onSuccess: invalidateComments,
  })

  return (
    <div ref={animateRef} className="w-full space-y-12">
      {isLoading ? (
        <LoadingAnimation />
      ) : !comments || comments.length === 0 ? (
        <NoContent>No comments</NoContent>
      ) : (
        // For the root level tree, we use "null" as comment ID. See "createCommentTree" docs.
        createCommentTree(createRootComments(comments), null).map((comment) => (
          <Comment
            postId={postId}
            key={comment.commentId}
            isRoot={true}
            comment={comment}
            userId={userId}
            onAdd={({ commentParentId, text }) =>
              createComment.mutate({
                postId,
                text,
                commentParentId,
              })
            }
            onUpvote={(commentId) => {
              upvote.mutate({ commentId })
            }}
            onDownvote={(commentId) => downvote.mutate({ commentId })}
            onRemove={(commentId) => deleteOne.mutate({ commentId })}
          />
        ))
      )}
    </div>
  )
}
