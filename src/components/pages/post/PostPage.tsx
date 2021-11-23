import { useState, useRef } from 'react'
import { Box } from '../../Box'
import { Button } from '../../Button'
import { DropdownItem, DropdownSelect } from '../../DropdownSelect'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconEdit } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { Page, PageSection } from '../../Page'
import { usePost } from '../../../data/use-post'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { Views } from '../../Likes'
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
import { CalendarIcon } from '@heroicons/react/solid'
import {
  BookmarkAltIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from '@heroicons/react/outline'

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
}: PostPageProps & {
  post: PostPostPage
  isPostEditMode: boolean
}): JSX.Element {
  const { updatePost, createPostSegment, isLoading } = usePost(postId)
  const [hasNewSegmentBeenEdited, setHasNewSegmentBeenEdited] = useState(true)
  const newSegmentId = 'new-segment-id'

  const [isShownCategoryDropdown, setIsShownCategoryDropdown] = useState(false)
  const [refCategory] = useHover<HTMLDivElement>(() => {
    console.log(
      new Date().toISOString().split('.')[0].replace('T', '  '),
      'here'
    )
    setIsShownCategoryDropdown(true)
  })
  useOnClickOutside(refCategory, () => setIsShownCategoryDropdown(false))

  async function handleCreateSegment(): Promise<void> {
    const postSegmentToCreate: ApiPostSegmentCreateRequestBody['postSegmentToCreate'] =
      {
        title: '',
        subtitle: '',
      }

    setSegments((prevSegments) => [
      ...prevSegments,
      {
        postId: post.id,
        id: newSegmentId + Math.random(),
        title: postSegmentToCreate.title ?? '',
        subtitle: postSegmentToCreate.subtitle ?? '',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

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

  /**
   * Removes tags which are already included in a post from a list of tags.
   */
  function filterTags(tagsToFilter: TagPostPage[]): TagPostPage[] {
    return tagsToFilter.filter(
      (tagToFilter) => !post.tags.some((tag) => tag.id === tagToFilter.id)
    )
  }

  return (
    <Page>
      <PageSection hideTopMargin>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-4/5">
            {isTitleEditable ? (
              <div className="h-40 mr-10" ref={refTitleEdit}>
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
                  className="flex-1 min-w-0"
                >
                  <h2 className="text-2xl font-bold leading-7 sm:text-3xl">
                    {isPostEditMode && isHovered && (
                      <span className="mr-10">
                        <IconEdit className="inline" />
                      </span>
                    )}

                    <span>{post.title}</span>
                  </h2>
                </div>

                <div className="flex-1 mt-4">
                  {!isTitleEditable && (
                    <span className="italic">{post.subtitle}</span>
                  )}
                </div>

                <div className="flex-1 mt-4">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
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
                        <p className="inline py-3">
                          <BookmarkAltIcon className="inline w-4 h-4" />
                          <span className="ml-2 py-1.5 uppercase tracking-wider">
                            {post.category.title}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <Views>{post.views}</Views>
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <Comments>{post.comments.length}</Comments>
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <CalendarIcon className="inline w-4 h-4" />
                      <span className="ml-2 py-1.5">
                        {post.createdAt.toISOString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/5">
            <div className="flex divide-gray-400 divide-x">
              <div className="flex-1 flex flex-col items-center justify-center">
                <Avatar
                  hasUserAvatar={post.author.hasAvatar ?? false}
                  size="medium"
                  userId={post.authorId}
                />

                <div className="mt-4 flex flex-col items-center text-center justify-center">
                  <h2 className="font-medium leading-none title-font text-gray-900 text-lg">
                    {post.author.username}
                  </h2>
                </div>
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
            <div className="flex-1 w-full">
              <Box>
                <div className="w-full flex items-center space-x-3">
                  <span className="italic">Search</span>
                  <span className="font-bold">{inputTagSearch}</span>
                  {isFetching && <LoadingAnimation small />}
                </div>
                <FormInput
                  initialValue={inputTagSearch}
                  onSubmit={async (inputNew) => setInputTagSearch(inputNew)}
                />
                <div className="mt-2 flex flex-wrap -m-1">
                  {tagsSearched &&
                    filterTags(tagsSearched).map((tag) => (
                      <Tag key={tag.id} tag={tag} onClick={handleAddTag} />
                    ))}
                </div>
              </Box>
            </div>
            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular in general</p>
                <div className="mt-2 flex flex-wrap -m-1">
                  {filterTags(tagsSorted).map((tag) => (
                    <Tag key={tag.id} tag={tag} onClick={handleAddTag} />
                  ))}
                </div>
              </Box>
            </div>
            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular for this category</p>
                <div className="mt-2 flex-1 flex flex-wrap -m-1">
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
        <div className="md:flex w-full items-start">
          <div className="md:w-1/4 md:sticky top-40">
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
                  index={index + 1}
                  postId={post.id}
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

      <PageSection>
        <PostComments
          comments={post.comments.map((comment) => ({
            commentId: comment.commentId,
            commentParentId: comment.commentParentId,
            text: comment.text,
            authorId: comment.authorId,
            authorUsername: comment.author.username,
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
  authorId: string
  authorUsername: string
}

type PostCommentTreeComment = PostComment & {
  commentChilds: PostCommentTreeComment[]
}

function Comment({
  comment,
  isRoot = false,
}: {
  comment: PostCommentTreeComment
  isRoot: boolean
}) {
  return (
    <div
      className={`space-y-2 ${
        isRoot ? 'bg-lime-100 rounded-xl p-10' : 'ml-14'
      }`}
    >
      <div className="w-full flex">
        <div className="w-10 flex flex-row text-center text-lime-400 bold justify-center leading-none">
          <PlusCircleIcon />
          <MinusCircleIcon />
        </div>
        <div className="flex-grow ml-2">
          <span>{comment.text}</span>
        </div>
      </div>

      <div className="w-full flex">
        <div className="w-10 flex flex-col text-center bold items-center leading-none">
          <Avatar
            size="tiny"
            userId={comment.authorId}
            hasUserAvatar={comment.authorUsername === 'bennett' ? true : false}
          />
        </div>
        <div className="leading-none flex items-center space-x-2 text-gray-400 text-sm">
          <span className="ml-2">{comment.authorUsername}</span>
        </div>
      </div>

      {comment.commentChilds.map((comment) => (
        <Comment key={comment.commentId} isRoot={false} comment={comment} />
      ))}
    </div>
  )
}

export function PostComments({
  comments,
}: {
  comments: PostComment[]
}): JSX.Element {
  const [commentsForTree] = useState<PostCommentTreeComment[]>(
    comments.map((comm) => ({ ...comm, commentChilds: [] }))
  )
  return (
    <div className="w-full space-y-12">
      {/* For the root level tree, we use "true" as comment ID. See "createCommentTree" docs. */}
      {createCommentTree(commentsForTree, null).map((comm) => (
        <Comment key={comm.commentId} isRoot={true} comment={comm} />
      ))}
    </div>
  )
}
