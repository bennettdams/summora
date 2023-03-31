import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { PostCategoryId } from '@prisma/client'
import { useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { schemaTagSearch } from '../lib/schemas'
import { trpc } from '../util/trpc'
import { useDebounce } from '../util/use-debounce'
import { useOnClickOutside } from '../util/use-on-click-outside'
import { useZodForm } from '../util/use-zod-form'
import { Box } from './Box'
import { ButtonAdd, ButtonAddSpecial } from './Button'
import { IconTrash } from './Icon'
import { LoadingAnimation } from './LoadingAnimation'
import { NoContent } from './NoContent'
import { Form, Input } from './form'

type TagTagslist = {
  tagId: string
  label: string
}

/**
 * TODO "onLinkClick" or something that leads to /explore with prefilter
 */
export function TagsList({
  tags,
  showAddButton = false,
  onAddButtonClick,
  onRemoveClick,
}: {
  tags: TagTagslist[] | null
  showAddButton?: boolean
  onAddButtonClick?: () => void
  onRemoveClick?: (tagIdToRemove: string) => void
}): JSX.Element {
  const [animateTagsRef] = useAutoAnimate<HTMLDivElement>()

  return (
    <>
      <div
        ref={animateTagsRef}
        className="flex flex-wrap items-center justify-start"
      >
        {!tags || tags.length === 0 ? (
          <NoContent>No tags yet.</NoContent>
        ) : (
          tags.map((tag) => (
            <Tag
              key={tag.tagId}
              tag={tag}
              onClick={(tag) => onRemoveClick?.(tag.tagId)}
              handleRemoving={!!onRemoveClick}
            />
          ))
        )}
        {showAddButton && onAddButtonClick && (
          <div className="ml-2 flex flex-row items-center justify-center">
            <ButtonAddSpecial onClick={onAddButtonClick} />
          </div>
        )}
      </div>
    </>
  )
}

export function Tag({
  tag,
  onClick,
  handleRemoving = false,
}: {
  tag: TagTagslist
  onClick?: (tag: TagTagslist) => void
  /**
   * Use to handle removing on click with confirmation.
   */
  handleRemoving?: boolean
}): JSX.Element {
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)
  const tagRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(tagRef, () => setShowRemoveConfirmation(false))

  return (
    <div
      ref={tagRef}
      className={`m-1 inline rounded bg-dtertiary py-0.5 px-1.5 leading-none text-white hover:bg-dsecondary ${
        onClick && 'cursor-pointer'
      }`}
      key={tag.tagId}
      // Don't execute on click when this tag is supposed to handle removing - this happens further down then.
      onClick={() => !handleRemoving && onClick?.(tag)}
    >
      {!onClick || !handleRemoving || !showRemoveConfirmation ? (
        <span
          onClick={() => !!handleRemoving && setShowRemoveConfirmation(true)}
          className="inline-block text-xs uppercase tracking-widest"
        >
          {tag.label}
        </span>
      ) : (
        <div
          className="flex"
          onClick={() => !!handleRemoving && onClick?.(tag)}
        >
          <IconTrash size="small" className="hover:text-white" />
          <span className="inline-block text-xs font-semibold uppercase tracking-widest">
            Confirm
          </span>
        </div>
      )}
    </div>
  )
}

type SchemaTagSearch = z.infer<typeof schemaTagSearch>

/**
 * Removes tags which are already included in a another list of tags.
 */
function filterTags({
  tagsToFilter,
  tagsExisting,
}: {
  tagsToFilter: TagTagslist[]
  tagsExisting: TagTagslist[]
}): TagTagslist[] {
  return tagsToFilter.filter(
    (tagToFilter) =>
      !tagsExisting.some(
        (tagExisting) => tagExisting.tagId === tagToFilter.tagId
      )
  )
}

export function TagsSelection({
  onAdd,
  onOutsideClick,
  tagsExisting,
  postCategoryId,
  showCreateButton = false,
  postId,
}: {
  onAdd: (tag: TagTagslist) => void
  tagsExisting: TagTagslist[]
  postCategoryId: PostCategoryId | null
  onOutsideClick?: () => void
} & (
  | { showCreateButton: true; postId: string }
  | { showCreateButton?: false; postId?: null }
)): JSX.Element {
  const utils = trpc.useContext()
  const { data: tagsPopular, isLoading: isLoadingTagsPopular } =
    trpc.postTags.popularOverall.useQuery()

  const createPostTag = trpc.postTags.create.useMutation()

  const refTagSelection = useRef<HTMLDivElement>(null)
  useOnClickOutside(refTagSelection, () => onOutsideClick?.())

  const defaultValuesTagSearch: SchemaTagSearch = useMemo(
    () => ({ searchInput: '' }),
    []
  )
  const {
    handleSubmit: handleSubmitTagSearch,
    register: registerTagSearch,
    watch: watchTagSearch,
    resetField,
    formState: {
      errors: { searchInput: errorSearchInput },
    },
  } = useZodForm({
    schema: schemaTagSearch,
    defaultValues: defaultValuesTagSearch,
    mode: 'onSubmit',
  })

  const inputTagSearch = watchTagSearch('searchInput')

  const inputTagSearchDebounced = useDebounce(inputTagSearch, 500)
  const { data: tagsSearchResult, isFetching } = trpc.postTags.search.useQuery(
    { searchInput: inputTagSearchDebounced },
    {
      enabled:
        !!inputTagSearchDebounced &&
        inputTagSearchDebounced.length >=
          (schemaTagSearch.shape.searchInput.minLength ?? 2),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

  async function handleAddTag(tag: TagTagslist): Promise<void> {
    onAdd(tag)
  }

  function handleCreateTag() {
    if (!inputTagSearch)
      throw new Error(
        'There is no input for the tag label, this should not have happened.'
      )
    if (!postId)
      throw new Error(
        'Wanted to create a tag but post ID is null, show not have happened.'
      )
    createPostTag.mutate(
      { postId, tagLabel: inputTagSearch },
      {
        onSuccess: () => {
          resetField('searchInput')
          utils.postTags.invalidate()
          utils.posts.invalidate()
        },
      }
    )
  }

  return (
    <div
      className="flex flex-col space-y-6 lg:flex-row lg:space-x-10 lg:space-y-0"
      ref={refTagSelection}
    >
      <div className="w-full flex-1 space-y-6">
        <Box>
          <Form
            onSubmit={handleSubmitTagSearch(() => {
              // noop, this is executed via debounce above
            })}
            className={
              showCreateButton ? 'flex flex-row items-center space-x-4' : ''
            }
          >
            <Input
              {...registerTagSearch('searchInput')}
              placeholder="Search for tags.."
              isSpecial
              isLoading={isFetching}
              small
              validationErrorMessage={errorSearchInput?.message}
            />

            {showCreateButton && (
              <>
                <p className="uppercase tracking-wide">or</p>

                <ButtonAdd disabled={!inputTagSearch} onClick={handleCreateTag}>
                  Create
                </ButtonAdd>
              </>
            )}
          </Form>

          <div className="-m-1 mt-2 flex flex-wrap">
            {tagsSearchResult &&
              (tagsSearchResult.length === 0 ? (
                <div className="flex basis-full items-center px-1 text-center">
                  <div className="flex-1 text-sm">
                    <p>No results for your search.</p>
                    {showCreateButton && (
                      <p>Maybe you want to create this tag?</p>
                    )}
                  </div>
                </div>
              ) : (
                filterTags({
                  tagsToFilter: tagsSearchResult,
                  tagsExisting,
                }).map((tag) => (
                  <Tag key={tag.tagId} tag={tag} onClick={handleAddTag} />
                ))
              ))}
          </div>
        </Box>
      </div>

      {postCategoryId && (
        <TagsPopularCategory
          tagsExisting={tagsExisting}
          onAdd={handleAddTag}
          postCategoryId={postCategoryId}
        />
      )}

      <div className="flex-1">
        <Box inline>
          <p className="italic">Popular overall</p>
          <div className="-m-1 mt-2 flex flex-wrap">
            {isLoadingTagsPopular ? (
              <LoadingAnimation />
            ) : !tagsPopular ? (
              <NoContent>No tags.</NoContent>
            ) : (
              filterTags({
                tagsToFilter: tagsPopular,
                tagsExisting,
              }).map((tag) => (
                <Tag key={tag.tagId} tag={tag} onClick={handleAddTag} />
              ))
            )}
          </div>
        </Box>
      </div>
    </div>
  )
}

function TagsPopularCategory({
  postCategoryId,
  tagsExisting,
  onAdd,
}: {
  postCategoryId: PostCategoryId
  tagsExisting: TagTagslist[]
  onAdd: (tag: TagTagslist) => void
}): JSX.Element {
  const {
    data: tagsPopularByCategory,
    isLoading: isLoadingTagsPopularByCategory,
  } = trpc.postTags.popularByCategoryId.useQuery(
    {
      categoryId: postCategoryId,
    },
    { enabled: postCategoryId !== null }
  )

  return (
    <div className="flex-1">
      <Box inline>
        <p className="italic">Popular for this category</p>
        <div className="-m-1 mt-2 flex flex-1 flex-wrap">
          {isLoadingTagsPopularByCategory ? (
            <LoadingAnimation />
          ) : !tagsPopularByCategory ? (
            <NoContent>No tags yet.</NoContent>
          ) : (
            filterTags({
              tagsToFilter: tagsPopularByCategory,
              tagsExisting,
            }).map((tag) => <Tag key={tag.tagId} tag={tag} onClick={onAdd} />)
          )}
        </div>
      </Box>
    </div>
  )
}
