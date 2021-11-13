import { useState, useRef } from 'react'
import { Box } from '../../Box'
import { Button, ButtonAdd } from '../../Button'
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
import { Tag } from './Tag'
import { useSearchTags } from '../../../data/use-search-tags'
import { Avatar } from '../../Avatar'
import {
  ApiPostSegmentCreateRequestBody,
  ApiPostUpdateRequestBody,
} from '../../../services/api-service'

type QueryReturn = ReturnType<typeof usePost>
// exclude null, because the page will return "notFound" if post is null
type PostPostPage = Exclude<QueryReturn['post'], null>
export type SegmentPostPage = PostPostPage['segments'][number]
export type SegmentItemPostPage = SegmentPostPage['items'][number]
export type TagPostPage = PostPostPage['tags'][number]

export function PostPage(props: PostPageProps): JSX.Element {
  const { post } = usePost(props.postId)
  return !post ? (
    <p>no post</p>
  ) : (
    <PostPageInternal
      post={post}
      postId={props.postId}
      postCategories={props.postCategories}
      tagsSorted={props.tagsSorted}
      tagsSortedForCategory={props.tagsSortedForCategory}
    />
  )
}

function PostPageInternal({
  postId,
  post,
  postCategories,
  tagsSorted,
  tagsSortedForCategory,
}: PostPageProps & { post: PostPostPage }): JSX.Element {
  const { updatePost, createPostSegment, isLoading } = usePost(postId)
  const [hasNewSegmentBeenEdited, setHasNewSegmentBeenEdited] = useState(true)
  const newSegmentId = 'new-segment-id'

  const [refCategory] = useHover<HTMLDivElement>(() =>
    setShowCategoryDropdown(true)
  )
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useOnClickOutside(refCategory, () => setShowCategoryDropdown(false))

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

  async function handleOnCategorySelect(newCategory: DropdownItem) {
    setShowCategoryDropdown(false)

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

  async function handleRemoveTag(tagToRemove: TagPostPage): Promise<void> {
    const tagsNew: TagPostPage[] = post.tags.filter(
      (tag) => tag.id !== tagToRemove.id
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

  async function handleAddTag(tagToAdd: TagPostPage): Promise<void> {
    const alreadyIncluded = post.tags.some((tag) => tag.id === tagToAdd.id)

    if (!alreadyIncluded) {
      const tagsNew: TagPostPage[] = [...post.tags, tagToAdd]

      const postToUpdate: ApiPostUpdateRequestBody = {
        tagIds: tagsNew.map((tag) => tag.id),
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
          <div
            className="w-full md:w-2/3"
            ref={refTitle}
            onClick={() => setIsTitleEditable(true)}
          >
            {isTitleEditable ? (
              <div className="h-40 mr-10" ref={refTitleEdit}>
                <button className="inline" form={formId} type="submit">
                  <IconCheck />
                </button>
                <IconX
                  onClick={() => setIsTitleEditable(false)}
                  className="ml-4"
                />
                <FormInput
                  placeholder="Title.."
                  initialValue={post.title}
                  onSubmit={handleUpdateTitle}
                  formId={formId}
                />
                <FormInput
                  placeholder="Subitle.."
                  initialValue={post.subtitle ?? ''}
                  onSubmit={handleUpdateSubtitle}
                  autoFocus={false}
                  formId={formId}
                />
              </div>
            ) : (
              <>
                <p className="text-5xl text-lime-600">
                  {isHovered && (
                    <span className="mr-10">
                      <IconEdit className="inline" />
                    </span>
                  )}

                  <span>{post.title}</span>
                </p>
              </>
            )}
          </div>

          <div className="w-full md:w-1/3">
            <Box smallPadding>
              <div className="flex divide-gray-400 divide-x">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Avatar
                    hasUserAvatar={post.author.hasAvatar ?? false}
                    size="medium"
                    userId={post.authorId}
                  />

                  <div className="w-12 h-1 my-2 bg-indigo-500 rounded"></div>

                  <div className="flex flex-col items-center text-center justify-center">
                    <h2 className="font-medium leading-none title-font text-gray-900 text-lg">
                      {post.author.username}
                    </h2>
                  </div>
                </div>

                <div className="flex-1 text-center">
                  <div>
                    <Views>1.2K</Views>
                    <span className="ml-2">
                      <Comments>6</Comments>
                    </span>
                  </div>
                  <p>
                    Created at: {post.createdAt.getUTCMonth()}-
                    {post.createdAt.getUTCDate()}
                  </p>
                  <p>
                    Updated at: {post.updatedAt.getUTCMonth()}-
                    {post.updatedAt.getUTCDate()}
                  </p>
                </div>
              </div>
            </Box>
          </div>
        </div>
      </PageSection>

      <PageSection hideTopMargin>
        <div className="inlined mt-2 flex w-full" ref={refCategory}>
          <div className="flex-grow">
            {!isTitleEditable && (
              <span className="italic ml-2">{post.subtitle}</span>
            )}
          </div>

          <div className="w-1/3 text-center">
            {isLoading ? (
              <LoadingAnimation small />
            ) : showCategoryDropdown ? (
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
              <p className="uppercase inline-block text-xl italic font-medium tracking-widest">
                {post.category.title}
              </p>
            )}
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="flex flex-wrap items-center -m-1">
          {post.tags.map((tag) => (
            <Tag key={tag.id} tagInitial={tag} onClick={handleRemoveTag} />
          ))}
        </div>
      </PageSection>

      <PageSection>
        {!isShownTagSelection ? (
          <div className="flex flex-row items-center justify-center">
            <span>Add tag</span>
            <span className="ml-2">
              <ButtonAdd
                size="big"
                onClick={() => setIsShownTagSelection(true)}
              />
            </span>
          </div>
        ) : (
          <div className="flex space-x-10">
            <div className="flex-1">
              <Box inline>
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
                      <Tag
                        key={tag.id}
                        tagInitial={tag}
                        onClick={handleAddTag}
                      />
                    ))}
                </div>
              </Box>
            </div>
            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular in general</p>
                <div className="mt-2 flex flex-wrap -m-1">
                  {filterTags(tagsSorted).map((tag) => (
                    <Tag key={tag.id} tagInitial={tag} onClick={handleAddTag} />
                  ))}
                </div>
              </Box>
            </div>
            <div className="flex-1">
              <Box inline>
                <p className="italic">Popular for this category</p>
                <div className="mt-2 flex-1 flex flex-wrap -m-1">
                  {filterTags(tagsSortedForCategory).map((tag) => (
                    <Tag key={tag.id} tagInitial={tag} onClick={handleAddTag} />
                  ))}
                </div>
              </Box>
            </div>
          </div>
        )}
      </PageSection>

      <PageSection>
        <div className="space-y-16">
          {post.segments.map((segment, index) => (
            <PostSegment
              index={index + 1}
              postId={post.id}
              key={segment.id}
              segment={segment}
              isEditableExternal={
                !hasNewSegmentBeenEdited && index === post.segments.length - 1
              }
              onInitialEdit={() => setHasNewSegmentBeenEdited(true)}
            />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <Button
          onClick={handleCreateSegment}
          disabled={!hasNewSegmentBeenEdited}
        >
          Add step
        </Button>
        {isLoading && <LoadingAnimation />}
      </PageSection>
    </Page>
  )
}
