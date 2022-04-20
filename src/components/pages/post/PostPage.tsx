import { useState, useRef, useEffect, FormEvent } from 'react'
import { Box } from '../../Box'
import { Button } from '../../Button'
import { DropdownItem, DropdownSelect } from '../../DropdownSelect'
import { FormInput } from '../../FormInput'
import {
  IconCheck,
  IconX,
  IconTrash,
  IconReply,
  IconCategory,
  IconDate,
} from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { Page, PageSection } from '../../Page'
import { usePost } from '../../../data/use-post'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { ViewsIcon } from '../../ViewsIcon'
import { CommentsIcon } from '../../CommentsIcon'
import { PostPageProps } from '../../../pages/post/[postId]'
import { PostSegment } from './PostSegment'
import { useSearchTags } from '../../../data/use-search-tags'
import { Avatar } from '../../Avatar'
import {
  ApiPostSegmentCreateRequestBody,
  ApiPostUpdateRequestBody,
} from '../../../services/api-service'
import { Tag, TagsList } from '../../tag'
import { useAuth } from '../../../services/auth-service'
import { StepList } from '../../StepList'
import { PostLikes } from '../../post'
import { Link } from '../../Link'
import { VoteIcon } from '../../VoteIcon'
import { EditOverlay } from '../../EditOverlay'

type QueryReturn = ReturnType<typeof usePost>
// exclude null, because the page will return "notFound" if post is null
type PostPostPage = Exclude<QueryReturn['post'], null>
export type SegmentPostPage = PostPostPage['segments'][number]
export type SegmentItemPostPage = SegmentPostPage['items'][number]
export type TagPostPage = PostPostPage['tags'][number]

export function PostPage(props: PostPageProps): JSX.Element {
  const { post } = usePost(props.postId)
  const { userId } = useAuth()

  return !post ? (
    <p>no post</p>
  ) : (
    <PostPageInternal
      post={post}
      postId={props.postId}
      postCategories={props.postCategories}
      tagsSorted={props.tagsSorted}
      tagsSortedForCategory={props.tagsSortedForCategory}
      isPostEditable={props.isPostEditable}
      userId={userId}
    />
  )
}

/*
 * TODO split up into one component for editing & one for viewing
 */
function PostPageInternal({
  postId,
  post,
  postCategories,
  tagsSorted,
  tagsSortedForCategory,
  isPostEditable,
  userId,
}: PostPageProps & {
  post: PostPostPage
  userId: string | null
}): JSX.Element {
  const {
    updatePost,
    createPostSegment,
    createPostComment,
    deletePostComment,
    upvotePostComment,
    downvotePostComment,
    isLoading,
  } = usePost(postId)
  const [hasNewSegmentBeenEdited, setHasNewSegmentBeenEdited] = useState(true)

  async function handleCreateSegment(): Promise<void> {
    const postSegmentToCreate: ApiPostSegmentCreateRequestBody['postSegmentToCreate'] =
      {
        title: '',
        subtitle: '',
      }

    setHasNewSegmentBeenEdited(false)

    await createPostSegment({
      postId: post.id,
      postSegmentToCreate,
    })
  }

  // CATEGORY
  const [isShownCategoryDropdown, setIsShownCategoryDropdown] = useState(false)
  const [refCategory] = useHover<HTMLDivElement>(() =>
    setIsShownCategoryDropdown(true)
  )
  useOnClickOutside(refCategory, () => setIsShownCategoryDropdown(false))

  async function handleOnCategorySelect(newCategory: DropdownItem) {
    setIsShownCategoryDropdown(false)

    const postToUpdate: ApiPostUpdateRequestBody = {
      categoryId: newCategory.id,
    }

    await updatePost({
      postId: post.id,
      postToUpdate,
    })
  }

  // POST HEADER
  const [isPostHeaderEditable, setIsPostHeaderEditable] = useState(false)
  const refPostHeaderEdit = useRef<HTMLFormElement>(null)
  useOnClickOutside(refPostHeaderEdit, () => setIsPostHeaderEditable(false))

  const formId = `formPost-${postId}`

  const [inputs, setInputs] = useState<{
    title?: string | null
    subtitle?: string | null
  } | null>()

  function resetEditMode() {
    setIsPostHeaderEditable(false)
    setInputs(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (inputs) {
      let postToUpdate: ApiPostUpdateRequestBody | null = null
      if (inputs.title) {
        postToUpdate = { title: inputs.title }
      }
      if (inputs.subtitle) {
        postToUpdate = !postToUpdate
          ? { subtitle: inputs.subtitle }
          : { ...postToUpdate, subtitle: inputs.subtitle }
      }

      if (postToUpdate) {
        await updatePost({
          postId: post.id,
          postToUpdate,
        })
      }
    }

    resetEditMode()
  }

  // TAGS
  const [isShownTagSelection, setIsShownTagSelection] = useState(false)
  const refTagSelection = useRef<HTMLDivElement>(null)
  useOnClickOutside(refTagSelection, () => setIsShownTagSelection(false))

  async function handleRemoveTag(tagIdToRemove: string): Promise<void> {
    const tagsNew: TagPostPage[] = post.tags.filter(
      (tag) => tag.id !== tagIdToRemove
    )

    const postToUpdate: ApiPostUpdateRequestBody = {
      tagIds: tagsNew.map((tag) => tag.id),
    }

    await updatePost({
      postId: post.id,
      postToUpdate,
    })
  }
  const [inputTagSearch, setInputTagSearch] = useState('')
  const { tagsSearched, isFetching } = useSearchTags(inputTagSearch)

  async function handleAddTag(tagId: string): Promise<void> {
    const alreadyIncluded = post.tags.some((tag) => tag.id === tagId)

    if (!alreadyIncluded) {
      const postToUpdate: ApiPostUpdateRequestBody = {
        tagIds: [...post.tags.map((tag) => tag.id), tagId],
      }

      await updatePost({
        postId: post.id,
        postToUpdate,
      })
    }
  }

  /**
   * Removes tags which are already included in a post from a list of tags.
   */
  function filterTags(tagsToFilter: TagPostPage[]): TagPostPage[] {
    return tagsToFilter.filter(
      (tagToFilter) => !post.tags.some((tag) => tag.id === tagToFilter.id)
    )
  }

  // COMMENTS
  const [inputRootComment, setInputRootComment] = useState('')

  async function addComment(
    /**
     * `null` for root comments
     */
    commentParentId: string | null,
    text: string
  ) {
    await createPostComment({
      postId,
      commentParentId,
      postCommentToCreate: {
        text: text,
      },
    })
  }

  async function removeComment(commentId: string) {
    await deletePostComment(commentId)
  }

  return (
    <Page>
      {/* POST HEADER */}
      <PageSection hideTopMargin>
        <div className="w-full text-center">
          {isPostHeaderEditable ? (
            <form
              ref={refPostHeaderEdit}
              id={formId}
              onSubmit={handleSubmit}
              className="mx-auto mb-10 w-full lg:w-1/2"
            >
              <div className="flex items-center">
                <Button
                  isSubmit
                  onClick={() => {
                    // TODO placeholder, remove when we have FormSubmit button
                  }}
                >
                  <IconCheck /> Save
                </Button>
                <Button
                  onClick={(e) => {
                    // prevent form submit
                    e.preventDefault()
                    resetEditMode()
                  }}
                >
                  <IconX /> Cancel
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <FormInput
                  placeholder="Title.."
                  initialValue={post.title}
                  onChange={(input) =>
                    setInputs((prev) => ({ ...prev, title: input }))
                  }
                  formId={formId}
                >
                  Title
                </FormInput>

                <FormInput
                  placeholder="Subtitle.."
                  initialValue={post.subtitle ?? ''}
                  onChange={(input) =>
                    setInputs((prev) => ({ ...prev, subtitle: input }))
                  }
                  autoFocus={false}
                  formId={formId}
                >
                  Subtitle
                </FormInput>
              </div>
            </form>
          ) : (
            <EditOverlay
              isEnabled={isPostEditable}
              onClick={() => setIsPostHeaderEditable(true)}
            >
              <div
                onClick={() => isPostEditable && setIsPostHeaderEditable(true)}
              >
                <h2 className="font-bold text-2xl leading-7 sm:text-3xl">
                  <span className="text-dlila">{post.title}</span>
                </h2>
              </div>

              <div className="mt-4 flex-1">
                {!isPostHeaderEditable && (
                  <span className="italic text-dorange">{post.subtitle}</span>
                )}
              </div>
            </EditOverlay>
          )}
        </div>
      </PageSection>

      {/* META */}
      <PageSection hideTopMargin>
        <div className="flex flex-col lg:flex-row">
          <div className="flex w-full flex-col sm:flex-row sm:flex-wrap md:space-x-6 lg:w-4/5">
            {/* CATEGORY */}
            <div className="flex items-center text-sm" ref={refCategory}>
              {isPostEditable && isShownCategoryDropdown ? (
                <div className="inline-block w-full">
                  <DropdownSelect
                    onChange={handleOnCategorySelect}
                    items={postCategories.map((cat) => ({
                      id: cat.id,
                      title: cat.title,
                    }))}
                    initialItem={post.category}
                  />
                </div>
              ) : (
                // TODO jump to explore
                <div className="flex items-center text-sm">
                  <IconCategory />
                  <span className="ml-2 py-1.5">{post.category.title}</span>
                </div>
              )}
            </div>

            <div className="flex items-center text-sm">
              <ViewsIcon noOfViews={post.noOfViews} />
            </div>

            <div className="flex items-center text-sm">
              <CommentsIcon noOfComments={post.comments.length} />
            </div>

            <div className="flex items-center text-sm">
              <IconDate />
              <span className="ml-1">{post.createdAt.toISOString()}</span>
            </div>

            {/* LIKES */}
            <div className="flex flex-grow flex-col items-center justify-end md:flex-row">
              <div className="flex w-full justify-center md:w-1/5">
                <PostLikes
                  postId={postId}
                  noOfLikes={post.likedBy.length}
                  postLikedByUserIds={post.likedBy}
                  userId={userId}
                />
              </div>
            </div>
          </div>

          {/* AVATAR */}
          <div className="w-full lg:w-1/5">
            <Link to={`/user/${post.authorId}`}>
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl p-2 hover:bg-white">
                <Avatar
                  userId={post.authorId}
                  imageId={post.author.imageId}
                  imageBlurDataURL={post.author.imageBlurDataURL}
                  size="medium"
                />

                <div className="mt-4 flex flex-col items-center justify-center text-center">
                  <h2 className="text-lg font-semibold leading-none text-dlila">
                    {post.author.username}
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </PageSection>

      <PageSection hideTopMargin>
        <TagsList
          tags={post.tags.map((tag) => ({ id: tag.id, title: tag.title }))}
          onAddButtonClick={() => setIsShownTagSelection(true)}
          onRemoveClick={(tagIdToRemove) => handleRemoveTag(tagIdToRemove)}
          showAddButton={isPostEditable && !isShownTagSelection}
        />
      </PageSection>

      {isShownTagSelection && (
        <PageSection>
          <div className="flex space-x-10" ref={refTagSelection}>
            <div className="w-full flex-1">
              <Box>
                <div className="flex w-full items-center space-x-3">
                  <span className="italic">Search</span>
                  <span className="font-bold">{inputTagSearch}</span>
                  {isFetching && <LoadingAnimation small />}
                </div>
                <FormInput
                  initialValue={inputTagSearch}
                  onSubmit={async (inputNew) => setInputTagSearch(inputNew)}
                />
                <div className="-m-1 mt-2 flex flex-wrap">
                  {tagsSearched &&
                    filterTags(tagsSearched).map((tag) => (
                      <Tag key={tag.id} tag={tag} onClick={handleAddTag} />
                    ))}
                </div>
              </Box>
            </div>
            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular overall</p>
                <div className="-m-1 mt-2 flex flex-wrap">
                  {filterTags(tagsSorted).map((tag) => (
                    <Tag key={tag.id} tag={tag} onClick={handleAddTag} />
                  ))}
                </div>
              </Box>
            </div>
            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular for this category</p>
                <div className="-m-1 mt-2 flex flex-1 flex-wrap">
                  {filterTags(tagsSortedForCategory).map((tag) => (
                    <Tag key={tag.id} tag={tag} onClick={handleAddTag} />
                  ))}
                </div>
              </Box>
            </div>
          </div>
        </PageSection>
      )}

      <PageSection>
        {/* "items-start" to make "sticky" work. Without it, the sticky div has the full height of the flex container. */}
        <div className="w-full items-start md:flex">
          <div className="top-40 pr-10 md:sticky md:w-1/6">
            <StepList
              steps={post.segments.map((segment, index) => ({
                no: index,
                title: segment.title,
                subtitle: segment.subtitle,
              }))}
            />
          </div>

          <div className="md:w-4/6">
            <div className="space-y-16">
              {post.segments.map((segment, index) => (
                <PostSegment
                  postSegmentId={segment.id}
                  index={index + 1}
                  postId={post.id}
                  authorId={post.authorId}
                  key={segment.id}
                  segment={segment}
                  isPostEditable={isPostEditable}
                  isEditModeInitial={
                    !hasNewSegmentBeenEdited &&
                    index === post.segments.length - 1
                  }
                  onInitialEdit={() => setHasNewSegmentBeenEdited(true)}
                />
              ))}
            </div>
            {isPostEditable && (
              <div className="mt-20">
                <Button
                  onClick={handleCreateSegment}
                  disabled={!hasNewSegmentBeenEdited}
                >
                  Add segment
                </Button>
                {isLoading && <LoadingAnimation />}
              </div>
            )}
          </div>

          <div className="md:w-1/6">&nbsp;</div>
        </div>
      </PageSection>

      <PageSection title="Comments">
        <div className="mx-auto w-2/3">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              addComment(null, inputRootComment)
              setInputRootComment('')
            }}
          >
            <input
              className="h-16 w-full border-b border-dbrown bg-transparent p-8 outline-none focus:border-dorange focus:ring-dorange"
              name="rootCommentInput"
              placeholder="Leave a comment.."
              id="rootCommentInput"
              value={inputRootComment}
              required
              onChange={(e) => setInputRootComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setInputRootComment('')}
            />
          </form>
        </div>
      </PageSection>

      <PageSection>
        <PostComments
          userId={userId}
          onAddComment={addComment}
          onRemoveComment={removeComment}
          onUpvoteComment={upvotePostComment}
          onDownvoteComment={downvotePostComment}
          comments={post.comments.map((comment) => ({
            commentId: comment.commentId,
            commentParentId: comment.commentParentId,
            text: comment.text,
            createdAt: comment.createdAt,
            authorId: comment.authorId,
            authorUsername: comment.author.username,
            authorImageId: comment.author.imageId,
            authorImageBlurDataURL: comment.author.imageBlurDataURL,
            upvotedBy: comment.upvotedBy,
            downvotedBy: comment.downvotedBy,
          }))}
        />
      </PageSection>
    </Page>
  )
}

/**
 * Creates a comment tree from a flat array.
 * For root level comments, use "null" as "commentId".
 *
 * input:
 * [1 | 1.1 | 2 | 3 | 3.1 | 3.2]
 *
 * output:
 * [1 [1.1] | 2 | 3 [3.1, 3.2] ]
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

type PostComment = {
  commentId: string
  commentParentId: string | null
  text: string
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
  comment,
  isRoot = false,
  userId,
  onAdd,
  onRemove,
  onUpvote,
  onDownvote,
}: {
  comment: PostCommentTreeComment
  isRoot: boolean
  userId: string | null
  onAdd: (commentParentId: string, text: string) => void
  onRemove: (commentId: string) => void
  onUpvote: (commentId: string) => void
  onDownvote: (commentId: string) => void
}) {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)

  const [inputComment, setInputComment] = useState('')

  const refCommentInput = useRef<HTMLFormElement>(null)
  useOnClickOutside(refCommentInput, () => setShowCommentInput(false))

  return (
    <>
      <div
        className={`space-y-1 ${isRoot ? 'rounded-xl bg-white p-10' : 'ml-14'}`}
      >
        <div className="flex w-full">
          <div className="group relative grid w-10 place-items-center">
            <p className="font-bold block text-sm tracking-tight text-dorange group-hover:hidden">
              {comment.upvotedBy.length - comment.downvotedBy.length}
            </p>
            <p
              title="Upvotes | Downvotes"
              className="font-bold absolute hidden w-20 text-center text-xs tracking-tight text-dbrown group-hover:block"
            >
              {comment.upvotedBy.length} | {comment.downvotedBy.length}
            </p>
          </div>
          <div className="ml-2 grow">
            <span>{comment.text}</span>
          </div>
        </div>

        <div className="m-0 flex w-full text-sm">
          <div className="flex w-10 flex-row items-center justify-center text-center leading-none text-dbrown">
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
          <Link to={`/user/${comment.authorId}`} disablePrefetch>
            <div className="flex hover:underline">
              <div className="bold flex w-10 flex-col items-center text-center leading-none">
                <Avatar
                  size="tiny"
                  userId={comment.authorId}
                  imageId={comment.authorImageId}
                  imageBlurDataURL={comment.authorImageBlurDataURL}
                />
              </div>

              <div className="flex items-center space-x-2 leading-none text-dlila">
                <span className="ml-2">{comment.authorUsername}</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-2 leading-none text-zinc-400">
            <span className="ml-2">{comment.createdAt.toISOString()}</span>
          </div>

          <div className="group ml-4 flex items-center rounded px-2 hover:cursor-pointer hover:bg-dorange">
            {!showCommentInput && (
              <div
                className="flex items-center"
                onClick={() => setShowCommentInput(true)}
              >
                <IconReply size="small" className="group-hover:text-white" />
                <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-dorange group-hover:text-white">
                  Reply
                </span>
              </div>
            )}
          </div>

          {!!userId && comment.authorId === userId && (
            <div
              className="group ml-4 flex items-center rounded px-2 hover:cursor-pointer hover:bg-dorange"
              onClick={() => setShowRemoveConfirmation(true)}
            >
              {!showRemoveConfirmation ? (
                <div
                  className="flex items-center"
                  onClick={() => setShowRemoveConfirmation(true)}
                >
                  <IconTrash size="small" className="group-hover:text-white" />
                  <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-dorange group-hover:text-white">
                    Remove
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center"
                  onClick={() => onRemove(comment.commentId)}
                >
                  <IconTrash size="small" className="group-hover:text-white" />
                  <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-dorange group-hover:text-white">
                    Confirm
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!!showCommentInput && (
          <form
            ref={refCommentInput}
            className="md:w-2/3"
            onSubmit={async (e) => {
              e.preventDefault()
              onAdd(comment.commentId, inputComment)
              setInputComment('')
              setShowCommentInput(false)
            }}
          >
            <input
              className="h-10 w-full border-b border-dbrown bg-transparent p-4 outline-none focus:border-dorange focus:ring-dorange"
              name="commentInput"
              placeholder="Leave a reply.."
              id="commentInput"
              value={inputComment}
              required
              onChange={(e) => setInputComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setInputComment('')}
            />
          </form>
        )}

        {comment.commentChilds.map((comment) => (
          <Comment
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
    </>
  )
}

function createRootComments(comments: PostComment[]): PostCommentTreeComment[] {
  return comments.map((comm) => ({ ...comm, commentChilds: [] }))
}

export function PostComments({
  userId,
  comments,
  onAddComment,
  onRemoveComment,
  onUpvoteComment,
  onDownvoteComment,
}: {
  userId: string | null
  comments: PostComment[]
  onAddComment: (commentParentId: string, text: string) => void
  onRemoveComment: (commentId: string) => void
  onUpvoteComment: (commentId: string) => void
  onDownvoteComment: (commentId: string) => void
}): JSX.Element {
  const [rootComments, setRootComments] = useState<PostCommentTreeComment[]>(
    createRootComments(comments)
  )
  useEffect(() => setRootComments(createRootComments(comments)), [comments])

  return (
    <div className="w-full space-y-12">
      {/* For the root level tree, we use "null" as comment ID. See "createCommentTree" docs. */}
      {createCommentTree(rootComments, null).map((comment) => (
        <Comment
          key={comment.commentId}
          isRoot={true}
          comment={comment}
          userId={userId}
          onAdd={onAddComment}
          onRemove={onRemoveComment}
          onUpvote={onUpvoteComment}
          onDownvote={onDownvoteComment}
        />
      ))}
    </div>
  )
}
