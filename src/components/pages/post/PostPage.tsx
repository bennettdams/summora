import { useState, useRef, useEffect } from 'react'
import { Box } from '../../Box'
import { Button } from '../../Button'
import { DropdownItem, DropdownSelect } from '../../DropdownSelect'
import { FormInput } from '../../FormInput'
import {
  IconCheck,
  IconX,
  IconEdit,
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
import { Views } from '../../Views'
import { Comments } from '../../Comments'
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
import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/outline'
import { PostLikes } from '../../post'

type QueryReturn = ReturnType<typeof usePost>
// exclude null, because the page will return "notFound" if post is null
type PostPostPage = Exclude<QueryReturn['post'], null>
export type SegmentPostPage = PostPostPage['segments'][number]
export type SegmentItemPostPage = SegmentPostPage['items'][number]
export type TagPostPage = PostPostPage['tags'][number]

export function PostPage(props: PostPageProps): JSX.Element {
  const { post } = usePost(props.postId)
  const { user } = useAuth()

  return !post ? (
    <p>no post</p>
  ) : (
    <PostPageInternal
      post={post}
      postId={props.postId}
      postCategories={props.postCategories}
      tagsSorted={props.tagsSorted}
      tagsSortedForCategory={props.tagsSortedForCategory}
      isPostEditMode={user?.userId === post.authorId}
      userId={user?.userId ?? null}
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
  isPostEditMode = false,
  userId,
}: PostPageProps & {
  post: PostPostPage
  isPostEditMode: boolean
  userId: string | null
}): JSX.Element {
  const {
    updatePost,
    createPostSegment,
    createPostComment,
    deletePostComment,
    isLoading,
  } = usePost(postId)
  const [hasNewSegmentBeenEdited, setHasNewSegmentBeenEdited] = useState(true)

  const [isShownCategoryDropdown, setIsShownCategoryDropdown] = useState(false)
  const [refCategory] = useHover<HTMLDivElement>(() =>
    setIsShownCategoryDropdown(true)
  )
  useOnClickOutside(refCategory, () => setIsShownCategoryDropdown(false))

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

  const [isTitleEditable, setIsTitleEditable] = useState(false)
  const [refTitle, isHovered] = useHover<HTMLDivElement>()
  const refTitleEdit = useRef<HTMLDivElement>(null)
  useOnClickOutside(refTitleEdit, () => setIsTitleEditable(false))

  const [isShownTagSelection, setIsShownTagSelection] = useState(false)
  const refTagSelection = useRef<HTMLDivElement>(null)
  useOnClickOutside(refTagSelection, () => setIsShownTagSelection(false))

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

  async function handleUpdateTitle(inputValue: string): Promise<void> {
    if (inputValue) {
      const postToUpdate: ApiPostUpdateRequestBody = {
        title: inputValue,
      }

      setIsTitleEditable(false)

      await updatePost({
        postId: post.id,
        postToUpdate,
      })
    }
  }

  async function handleUpdateSubtitle(inputValue: string): Promise<void> {
    if (inputValue) {
      const postToUpdate: ApiPostUpdateRequestBody = {
        subtitle: inputValue,
      }

      setIsTitleEditable(false)

      await updatePost({
        postId: post.id,
        postToUpdate,
      })
    }
  }

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

  const formId = 'formPost'

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

  const [inputRootComment, setInputRootComment] = useState('')

  /**
   * Removes tags which are already included in a post from a list of tags.
   */
  function filterTags(tagsToFilter: TagPostPage[]): TagPostPage[] {
    return tagsToFilter.filter(
      (tagToFilter) => !post.tags.some((tag) => tag.id === tagToFilter.id)
    )
  }

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
      <PageSection hideTopMargin>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-4/5">
            {isTitleEditable ? (
              <div className="mr-10 h-40" ref={refTitleEdit}>
                <div className="flex space-x-8">
                  <button className="inline" form={formId} type="submit">
                    <IconCheck size="big" />
                  </button>
                  <IconX size="big" onClick={() => setIsTitleEditable(false)} />
                </div>

                <div className="mt-4 space-y-2">
                  <FormInput
                    placeholder="Title.."
                    initialValue={post.title}
                    onSubmit={handleUpdateTitle}
                    formId={formId}
                  >
                    Title
                  </FormInput>

                  <FormInput
                    placeholder="Subitle.."
                    initialValue={post.subtitle ?? ''}
                    onSubmit={handleUpdateSubtitle}
                    autoFocus={false}
                    formId={formId}
                  >
                    Subtitle
                  </FormInput>
                </div>
              </div>
            ) : (
              <div className="lg:flex lg:flex-col lg:items-start lg:justify-between">
                <div
                  ref={refTitle}
                  onClick={() => isPostEditMode && setIsTitleEditable(true)}
                  className="min-w-0 flex-1"
                >
                  <h2 className="font-bold text-2xl leading-7 sm:text-3xl">
                    {isPostEditMode && isHovered && (
                      <span className="mr-10">
                        <IconEdit className="inline" />
                      </span>
                    )}

                    <span>{post.title}</span>
                  </h2>
                </div>

                <div className="mt-4 flex-1">
                  {!isTitleEditable && (
                    <span className="italic">{post.subtitle}</span>
                  )}
                </div>

                <div className="mt-4 flex-1">
                  <div className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div
                      className="flex items-center text-sm text-gray-400"
                      ref={refCategory}
                    >
                      {isPostEditMode && isShownCategoryDropdown ? (
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
                        <div className="flex items-center text-sm text-gray-400">
                          <IconCategory />
                          <span className="ml-2 py-1.5">
                            {post.category.title}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <Views noOfViews={post.noOfViews} />
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <Comments noOfComments={post.comments.length} />
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <IconDate className="text-gray-400" />
                      <span className="ml-1">
                        {post.createdAt.toISOString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex w-full justify-center md:w-1/5">
            <PostLikes
              postId={postId}
              noOfLikes={post.likedBy.length}
              postLikedByUserIds={post.likedBy}
              userId={userId}
            />
          </div>

          <div className="w-full md:w-1/5">
            <div className="flex flex-1 flex-col items-center justify-center">
              <Avatar
                hasUserAvatar={post.author.hasAvatar ?? false}
                size="medium"
                userId={post.authorId}
              />

              <div className="mt-4 flex flex-col items-center justify-center text-center">
                <h2 className="text-lg font-semibold leading-none">
                  {post.author.username}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <TagsList
          tags={post.tags.map((tag) => ({ id: tag.id, title: tag.title }))}
          onAddButtonClick={() => setIsShownTagSelection(true)}
          onRemoveClick={(tagIdToRemove) => handleRemoveTag(tagIdToRemove)}
          showAddButton={isPostEditMode && !isShownTagSelection}
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
          <div className="top-40 pr-10 md:sticky md:w-1/4">
            <StepList
              steps={post.segments.map((segment, index) => ({
                no: index,
                title: segment.title,
                subtitle: segment.subtitle,
              }))}
            />
          </div>

          <div className="md:w-3/4">
            <div className="space-y-16">
              {post.segments.map((segment, index) => (
                <PostSegment
                  postSegmentId={segment.id}
                  index={index + 1}
                  postId={post.id}
                  authorId={post.authorId}
                  key={segment.id}
                  segment={segment}
                  isPostEditMode={isPostEditMode}
                  isEditableInitial={
                    !hasNewSegmentBeenEdited &&
                    index === post.segments.length - 1
                  }
                  onInitialEdit={() => setHasNewSegmentBeenEdited(true)}
                />
              ))}
            </div>
            {isPostEditMode && (
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
        </div>
      </PageSection>

      <PageSection title="Comments">
        <form
          className="md:w-2/3"
          onSubmit={async (e) => {
            e.preventDefault()
            addComment(null, inputRootComment)
            setInputRootComment('')
          }}
        >
          <input
            className="h-16 w-full border-b border-orange-500 bg-transparent p-8 outline-none focus:border-orange-300 focus:ring-orange-300"
            name="rootCommentInput"
            placeholder="Leave a comment.."
            id="rootCommentInput"
            value={inputRootComment}
            required
            onChange={(e) => setInputRootComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setInputRootComment('')}
          />
        </form>
      </PageSection>

      <PageSection>
        <PostComments
          userId={userId}
          onAddComment={addComment}
          onRemoveComment={removeComment}
          comments={post.comments.map((comment) => ({
            commentId: comment.commentId,
            commentParentId: comment.commentParentId,
            text: comment.text,
            createdAt: comment.createdAt,
            authorId: comment.authorId,
            authorUsername: comment.author.username,
            authorHasAvatar: comment.author.hasAvatar,
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
  authorHasAvatar: boolean
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
}: {
  comment: PostCommentTreeComment
  isRoot: boolean
  userId: string | null
  onAdd: (commentParentId: string, text: string) => void
  onRemove: (commentId: string) => void
}) {
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [inputComment, setInputComment] = useState('')

  return (
    <>
      <div
        className={`space-y-1 ${
          isRoot
            ? 'rounded-xl bg-gradient-to-br from-green-50 to-indigo-50 p-10'
            : 'ml-14'
        }`}
      >
        <div className="flex w-full">
          <div className="bold flex w-10 flex-row items-center justify-center text-center leading-none text-lime-400">
            <PlusCircleIcon className="h-4 w-4" />
            <MinusCircleIcon className="h-4 w-4" />
          </div>
          <div className="ml-2 grow">
            <span>{comment.text}</span>
          </div>
        </div>

        <div className="m-0 flex w-full text-xs text-gray-400">
          <div className="bold flex w-10 flex-col items-center text-center leading-none">
            <Avatar
              size="tiny"
              userId={comment.authorId}
              hasUserAvatar={comment.authorHasAvatar}
            />
          </div>

          <div className="flex items-center space-x-2 leading-none">
            <span className="ml-2">{comment.authorUsername}</span>
          </div>

          <div className="flex items-center space-x-2 leading-none">
            <span className="ml-2">{comment.createdAt.toISOString()}</span>
          </div>

          <div
            className="ml-4 flex items-center rounded px-2 hover:cursor-pointer hover:bg-white"
            onClick={() => setShowRemoveConfirmation(true)}
          >
            {!showCommentInput && (
              <div
                className="flex items-center"
                onClick={() => setShowCommentInput(true)}
              >
                <IconReply size="small" />
                <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-orange-400">
                  Reply
                </span>
              </div>
            )}
          </div>

          {!!userId && comment.authorId === userId && (
            <div
              className="ml-4 flex items-center rounded px-2 hover:cursor-pointer hover:bg-white"
              onClick={() => setShowRemoveConfirmation(true)}
            >
              {!showRemoveConfirmation ? (
                <div
                  className="flex items-center"
                  onClick={() => setShowRemoveConfirmation(true)}
                >
                  <IconTrash size="small" />
                  <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-orange-400">
                    Remove
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center"
                  onClick={() => onRemove(comment.commentId)}
                >
                  <IconTrash size="small" />
                  <span className="ml-1 inline-block text-xs uppercase leading-none tracking-widest text-orange-400">
                    Confirm
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!!showCommentInput && (
          <form
            className="md:w-2/3"
            onSubmit={async (e) => {
              e.preventDefault()
              onAdd(comment.commentId, inputComment)
              setInputComment('')
              setShowCommentInput(false)
            }}
          >
            <input
              className="h-10 w-full border-b border-orange-500 bg-transparent p-4 outline-none focus:border-orange-300 focus:ring-orange-300"
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
}: {
  userId: string | null
  comments: PostComment[]
  onAddComment: (commentParentId: string, text: string) => void
  onRemoveComment: (commentId: string) => void
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
        />
      ))}
    </div>
  )
}
