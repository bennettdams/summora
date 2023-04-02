import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { PostCategoryId } from '@prisma/client'
import { useRouter } from 'next/router'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useFormState } from 'react-hook-form'
import { z } from 'zod'
import {
  schemaCreatePostComment,
  schemaUpdatePost,
  schemaUpdatePostCategory,
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
import { IconCategory, IconDate, IconOptions, IconReply } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { NoContent } from '../../NoContent'
import { Page, PageSection } from '../../Page'
import { StepList } from '../../StepList'
import { ViewsIcon } from '../../ViewsIcon'
import { VoteIcon } from '../../VoteIcon'
import { DonateButton } from '../../donation'
import {
  Form,
  FormLabel,
  FormSelect,
  Input,
  useIsSubmitEnabled,
} from '../../form'
import { Link } from '../../link'
import { Modal, useModal } from '../../modal'
import { PostLikes } from '../../post'
import { TagsList, TagsSelection } from '../../tag'
import { Title } from '../../typography'
import { PostSegment } from './PostSegment'

export type SegmentPostPage = RouterOutput['postSegments']['byPostId'][number]
export type SegmentItemPostPage = SegmentPostPage['items'][number]

type SchemaUpdate = z.infer<typeof schemaUpdatePost>
type SchemaUpdateCategory = z.infer<typeof schemaUpdatePostCategory>
type SchemaCreateComment = z.infer<typeof schemaCreatePostComment>

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
  const router = useRouter()
  const { data: segments, isLoading: isLoadingSegments } =
    trpc.postSegments.byPostId.useQuery({
      postId,
    })

  const deletePost = trpc.posts.delete.useMutation()

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
      <PostHeader
        userId={userId}
        authorId={post.authorId}
        postId={postId}
        isPostEditable={isPostEditable}
        title={post.title}
        subtitle={post.subtitle}
      />

      {/* META */}
      <PageSection hideTopMargin>
        <div className="relative grid grid-cols-4 place-items-center">
          {/* LIKES */}
          {/* Negative margin to push the button up. */}
          <div className="absolute top-0 right-0 -mt-10 lg:hidden">
            <PostLikes iconSize="huge" postId={postId} userId={userId} />
          </div>

          {/* CATEGORY */}
          <div className="col-span-4 flex h-10 w-full items-center justify-center lg:col-span-1 lg:justify-end lg:pr-2">
            <CategorySelect
              postId={postId}
              categoryIdInitial={post.postCategoryId}
              shouldShowDropdown={isPostEditable && isShownCategoryDropdown}
              refExternal={refCategory}
            />
          </div>

          {/* META INFO */}
          <div className="col-span-4 flex w-full items-center justify-center gap-6 lg:col-span-1 lg:justify-start lg:pl-2">
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

          {/* DONATE */}
          <div className="col-span-2 lg:col-span-1 lg:flex lg:w-full lg:justify-end">
            <DonateButton userId={post.authorId} />
          </div>

          {/* AVATAR */}
          <div className="col-span-2 lg:col-span-1">
            <Link to={ROUTES.user(post.authorId)}>
              <div className="flex flex-col items-center justify-center rounded-xl py-2 px-10 duration-200 hover:bg-white hover:transition-colors hover:ease-in-out">
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
          <div className="col-span-2 col-start-3 max-w-full lg:col-span-1 lg:col-start-4">
            <h2 className="truncate text-lg font-semibold leading-none text-dprimary">
              {post.author.username}
            </h2>
          </div>

          {/* TAGS */}
          <div className="col-span-4 mt-8 lg:col-span-2 lg:col-start-2">
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
            <div className="mt-6 space-y-6 text-center">
              {isShownTagSelection && (
                <>
                  <Title>Select or create a tag</Title>
                  <TagsSelection
                    showCreateButton={true}
                    postId={postId}
                    onAdd={(tag) =>
                      addToPost.mutate({ postId, tagId: tag.tagId })
                    }
                    onOutsideClick={() => setIsShownTagSelection(false)}
                    postCategoryId={post.postCategoryId}
                    tagsExisting={tags ?? []}
                  />
                </>
              )}
            </div>
          </div>

          {/* DELETE POST */}
          {isPostEditable && (
            <div className="col-span-4 mt-8 flex items-center text-sm lg:col-span-1 lg:col-start-4">
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
        </div>
      </PageSection>

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
  authorImageFileExtension: string | null
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
        className={`space-y-1 ${
          isRoot ? 'rounded-xl bg-white p-2 lg:p-10' : 'ml-4 lg:ml-14'
        }`}
      >
        <div className="flex w-full">
          <div className="group relative grid w-10 place-items-center">
            <p className="block text-sm font-semibold tracking-tight text-dsecondary group-hover:hidden">
              {comment.upvotedBy.length - comment.downvotedBy.length}
            </p>
            <p
              title="Upvotes | Downvotes"
              className="absolute hidden w-20 text-center text-xs tracking-tight text-dtertiary group-hover:block"
            >
              {comment.upvotedBy.length} | {comment.downvotedBy.length}
            </p>
          </div>

          <div className="ml-2 grow text-sm lg:text-base">
            {comment.isDeleted ? (
              <span className="line-through">deleted</span>
            ) : (
              <span>{comment.text}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between space-x-2 py-1 lg:py-2">
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

          <div className="flex flex-1 items-center overflow-hidden">
            <div className="grid place-items-center">
              <Avatar
                size="tiny"
                userId={comment.authorId}
                username={comment.authorUsername}
                imageId={comment.authorImageId}
                imageBlurDataURL={comment.authorImageBlurDataURL}
                imageFileExtension={comment.authorImageFileExtension}
              />
            </div>

            <Link
              className="group items-center overflow-hidden"
              to={ROUTES.user(comment.authorId)}
              disablePrefetch
            >
              <div className="flex items-center space-x-2 leading-none text-dprimary group-hover:underline">
                <span className="ml-2 truncate text-sm lg:text-base">
                  {comment.authorUsername}
                </span>
              </div>
            </Link>

            <div className="group ml-2 flex items-center rounded hover:cursor-pointer hover:bg-dsecondary lg:ml-4">
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

            <div className="ml-2 lg:ml-4">
              <CommentOptions
                comment={comment}
                userId={userId}
                onRemove={onRemove}
              />
            </div>
          </div>
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

function CommentOptions({
  comment,
  userId,
  onRemove,
}: {
  comment: PostCommentTreeComment
  userId: string | null
  onRemove: (commentId: string) => void
}): JSX.Element {
  const { isOpen, open, close } = useModal()

  function handleRemove() {
    onRemove(comment.commentId)
    close()
  }

  return (
    <>
      <div
        className="cursor-pointer rounded-full hover:bg-dsecondary"
        onClick={open}
      >
        <IconOptions className="text-current hover:text-white" />
      </div>

      <Modal
        isOpen={isOpen}
        close={close}
        title=""
        forceHalfWidth
        onConfirm={async () => console.log('Confirmed')}
        isSubmit={true}
      >
        <div className="flex flex-col items-center space-y-12">
          <div className="flex flex-col items-center space-x-2 leading-none text-gray-400">
            <p className="uppercase tracking-widest text-dprimary">
              Created at
            </p>
            <p className="mt-2">
              <DateTime format="YYYY-MM-DD hh:mm" date={comment.createdAt} />
            </p>
          </div>

          {!!userId && comment.authorId === userId && !comment.isDeleted && (
            <div className="group ml-4 flex items-center rounded px-2 hover:cursor-pointer hover:bg-dsecondary">
              <ButtonRemove onClick={handleRemove} />
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

function createRootComments(
  comments: RouterOutput['postComments']['byPostId']
): PostCommentTreeComment[] {
  return comments.map((comm) => ({
    ...comm,
    authorId: comm.author.id,
    authorUsername: comm.author.username,
    authorImageId: comm.author.imageId,
    authorImageBlurDataURL: comm.author.imageBlurDataURL,
    authorImageFileExtension: comm.author.imageFileExtension,
    upvotedBy: comm.upvotedBy.map((upvote) => ({ userId: upvote.id })),
    downvotedBy: comm.downvotedBy.map((downvote) => ({ userId: downvote.id })),
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
        <NoContent>No comments.</NoContent>
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
