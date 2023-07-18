import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { schemaCreatePostComment } from '../../../lib/schemas'
import { ROUTES } from '../../../services/routing'
import { RouterOutput, trpc } from '../../../util/trpc'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { useZodForm } from '../../../util/use-zod-form'
import { Avatar } from '../../Avatar'
import { ButtonRemove } from '../../Button'
import { DateTime } from '../../DateTime'
import { LoadingAnimation } from '../../LoadingAnimation'
import { VoteIcon } from '../../VoteIcon'
import { Form, Input, useIsSubmitEnabled } from '../../form'
import { IconOptions, IconReply } from '../../icons'
import { Link } from '../../link'
import { Modal, useModal } from '../../modal'
import { NoContent } from '../../typography'

type SchemaCreateComment = z.input<typeof schemaCreatePostComment>

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
  useOnClickOutside(refCommentInput, () => {
    // this is a hack to give the `Form`'s `onBlur` some time to execute before the input is hidden
    setTimeout(() => setShowCommentInput(false), 1)
  })

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
    control,
  } = useZodForm({
    schema: schemaCreatePostComment,
    defaultValues: defaultValues,
    mode: 'onSubmit',
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    isLoading: false,
    control,
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
                  <span className="ml-1 inline-block p-1.5 text-xs uppercase leading-none tracking-widest text-dsecondary group-hover:text-white">
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
              onBlur={handleSubmit((data) => {
                if (isSubmitEnabled) {
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
                }
              })}
            >
              <Input
                {...register('text')}
                blurOnEnterPressed
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
        isSubmit={true}
      >
        <div className="flex flex-col items-center space-y-12">
          <div className="flex flex-col items-center space-x-2 leading-none text-gray-400">
            <p className="uppercase tracking-widest text-dprimary">
              Created at
            </p>
            <p className="mt-2">
              <DateTime
                format="YYYY-MM-DD hh:mm"
                title="Created at"
                date={comment.createdAt}
              />
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

function useCreateComment(postId: string) {
  const utils = trpc.useContext()

  async function invalidateComments() {
    await utils.postComments.byPostId.invalidate({ postId })
  }

  return trpc.postComments.create.useMutation({
    onSuccess: invalidateComments,
  })
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

export function PostCreateComment({ postId }: { postId: string }): JSX.Element {
  const createComment = useCreateComment(postId)

  const defaultValuesCreateComment: SchemaCreateComment = useMemo(
    () => ({ postId, commentParentId: null, text: '' }),
    [postId]
  )

  const {
    handleSubmit,
    register,
    formState: {
      errors: { text: errorText },
      dirtyFields: { text: isInputDirty },
    },
    reset,
    control,
  } = useZodForm({
    schema: schemaCreatePostComment,
    defaultValues: defaultValuesCreateComment,
    mode: 'onSubmit',
    shouldFocusError: false,
  })

  const isSubmitEnabled = useIsSubmitEnabled({
    isLoading: createComment.isLoading,
    control,
  })

  return (
    <Form
      onBlur={handleSubmit((data) => {
        if (isSubmitEnabled) {
          createComment.mutate(
            { postId, commentParentId: null, text: data.text },
            {
              onSuccess: () => {
                reset()
              },
            }
          )
        }
      })}
    >
      <Input
        {...register('text')}
        placeholder="Enter a comment.."
        validationErrorMessage={!isInputDirty ? undefined : errorText?.message}
        isSpecial
        isLoading={createComment.isLoading}
        blurOnEnterPressed
      />
    </Form>
  )
}
