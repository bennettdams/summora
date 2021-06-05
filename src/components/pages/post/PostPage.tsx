import { PostCategory, PostTag } from '@prisma/client'
import { useState, useEffect, useRef } from 'react'
import { Box } from '../../Box'
import { Button } from '../../Button'
import { DropdownItem, DropdownSelect } from '../../DropdownSelect'
import { FormInput } from '../../FormInput'
import { IconCheck, IconX, IconEdit } from '../../Icon'
import { LoadingAnimation } from '../../LoadingAnimation'
import { Page, PageSection } from '../../Page'
import { usePost } from '../../../data/post-helper'
import { useHover } from '../../../util/use-hover'
import { useOnClickOutside } from '../../../util/use-on-click-outside'
import { PostSegmentCreate } from '../../../pages/api/post-segments'
import {
  PostSegmentPostAPI,
  PostUpdate,
} from '../../../pages/api/posts/[postId]'
import { Views } from '../../Likes'
import { Comments } from '../../Comments'
import { PostPostPage } from '../../../pages/post/[postId]'
import { PostSegment } from './PostSegment'
import { Tag } from './Tag'

export function PostPageWrapper({
  postInitial,
  postCategories,
}: {
  postInitial: PostPostPage
  postCategories: PostCategory[]
}): JSX.Element {
  const [post, setPost] = useState<PostPostPage>(postInitial)
  useEffect(() => setPost(postInitial), [postInitial])

  const { updatePost, createPostSegment, isLoading } = usePost(post.id, false)
  const [hasNewSegmentBeenEdited, setHasNewSegmentBeenEdited] = useState(true)
  const newSegmentId = 'new-segment-id'

  const [refCategory] = useHover<HTMLDivElement>(() =>
    setShowCategoryDropdown(true)
  )
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const [segments, setSegments] = useState<PostSegmentPostAPI[]>(post.segments)
  useEffect(() => setSegments(post.segments), [post.segments])

  const [tags, setTags] = useState<PostTag[]>(post.tags)
  useEffect(() => setTags(post.tags), [post.tags])

  useOnClickOutside(refCategory, () => setShowCategoryDropdown(false))

  async function handleCreate(): Promise<void> {
    const postSegmentToCreate: PostSegmentCreate['postSegmentToCreate'] = {
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

  async function handleOnCategorySelect(newCategory: DropdownItem) {
    setShowCategoryDropdown(false)

    const postNew = await updatePost({
      postId: post.id,
      postToUpdate: {
        title: post.title,
        subtitle: post.subtitle,
        categoryId: newCategory.id,
        tagIds: tags.map((tag) => tag.id),
      },
    })

    setPost(postNew)
  }

  async function handleUpdateTitle(inputValue: string): Promise<void> {
    const postToUpdate: PostUpdate['postToUpdate'] = {
      title: inputValue,
      subtitle: post.subtitle,
      categoryId: post.category.id,
      tagIds: tags.map((tag) => tag.id),
    }

    const title = postToUpdate.title
    if (typeof title === 'string') {
      setPost((prePost) => ({ ...prePost, title }))

      await updatePost({
        postId: post.id,
        postToUpdate,
      })
    }

    setIsTitleEditable(false)
  }

  async function handleUpdateSubitle(inputValue: string): Promise<void> {
    const postToUpdate: PostUpdate['postToUpdate'] = {
      title: post.title,
      subtitle: inputValue,
      categoryId: post.category.id,
      tagIds: tags.map((tag) => tag.id),
    }

    const subtitle = postToUpdate.subtitle
    if (typeof subtitle === 'string') {
      setPost((prePost) => ({ ...prePost, subtitle }))

      await updatePost({
        postId: post.id,
        postToUpdate,
      })
    }

    setIsTitleEditable(false)
  }

  async function handleRemoveTag(tagIdToRemove: string): Promise<void> {
    const tagsNew: PostTag[] = post.tags.filter(
      (tag) => tag.id !== tagIdToRemove
    )

    const postToUpdate: PostUpdate['postToUpdate'] = {
      title: post.title,
      subtitle: post.subtitle,
      categoryId: post.category.id,
      tagIds: tagsNew.map((tag) => tag.id),
    }
    setTags(tagsNew)

    const postUpdated = await updatePost({
      postId: post.id,
      postToUpdate,
    })

    setPost(postUpdated)
  }

  const formId = 'formPost'

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
                  onSubmit={handleUpdateSubitle}
                  autoFocus={false}
                  formId={formId}
                />
              </div>
            ) : (
              <>
                <p className="text-5xl text-white">
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
                  <div className="w-12 h-12 text-center rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>

                  <div className="w-12 h-1 my-2 bg-indigo-500 rounded"></div>

                  <div className="flex flex-col items-center text-center justify-center">
                    <h2 className="font-medium leading-none title-font text-gray-900 text-lg">
                      Username
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
              <LoadingAnimation />
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
          {tags.map((tag) => (
            <Tag
              key={tag.id}
              tagInitial={tag}
              onRemoveClick={handleRemoveTag}
            />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="space-y-16">
          {segments.map((segment, index) => (
            <PostSegment
              index={index + 1}
              postId={post.id}
              key={segment.id}
              segmentExternal={segment}
              isEditableExternal={
                !hasNewSegmentBeenEdited && index === segments.length - 1
              }
              onInitialEdit={() => setHasNewSegmentBeenEdited(true)}
            />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <Button onClick={handleCreate} disabled={!hasNewSegmentBeenEdited}>
          Add step
        </Button>
        {isLoading && <LoadingAnimation />}
      </PageSection>
    </Page>
  )
}
