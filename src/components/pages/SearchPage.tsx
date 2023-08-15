import { useRouter } from 'next/router'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { schemaPostSearch } from '../../lib/schemas'
import {
  getSearchParam,
  useSyncSearchParamFromState,
} from '../../services/router-service'
import { trpc, type RouterInput } from '../../util/trpc'
import { useDebounce } from '../../util/use-debounce'
import { useZodForm } from '../../util/use-zod-form'
import { Page, PageSection } from '../Page'
import {
  CategorySelectionList,
  useCategorySelectionList,
} from '../category-selection'
import { Form, Input, InputCheckbox } from '../form'
import { IconSearch } from '../icons'
import { PostsList } from '../post-reusable'
import { TagsList, TagsSelection } from '../tag'
import { Subtitle } from '../typography'

type SchemaPostSearch = z.input<typeof schemaPostSearch>

export function SearchPage(): JSX.Element {
  const router = useRouter()

  const defaultValuesPostSearch: SchemaPostSearch = useMemo(
    () => ({
      searchInput: '',
      includeTitle: true,
      includeSubtitle: true,
      includeSegmentsTitle: true,
      includeSegmentsSubtitle: true,
      tagIdsToFilter: [],
      categoryIdsToFilter: [],
    }),
    [],
  )
  const {
    handleSubmit: handleSubmitPostSearch,
    register: registerPostSearch,
    watch: watchPostSearch,
    resetField,
    setValue,
    formState: {
      errors: { searchInput: errorSearchInput },
    },
  } = useZodForm({
    schema: schemaPostSearch,
    defaultValues: defaultValuesPostSearch,
    // validation on every change so e.g. the URL search param synchronization gets the most recent "is valid" result
    mode: 'onChange',
  })
  const inputPostSearch = watchPostSearch('searchInput')
  const inputPostSearchDebounced = useDebounce(inputPostSearch, 500)
  const inputIncludeTitle = watchPostSearch('includeTitle')
  const inputIncludeSubtitle = watchPostSearch('includeSubtitle')
  const inputIncludeSegmentsTitle = watchPostSearch('includeSegmentsTitle')
  const inputIncludeSegmentsSubtitle = watchPostSearch(
    'includeSegmentsSubtitle',
  )

  const isInputPostSearchValid =
    !!inputPostSearchDebounced &&
    inputPostSearchDebounced.length >=
      (schemaPostSearch.shape.searchInput.minLength ?? 2)

  const [tagsForFilter, setTagsForFilter] = useState<
    { tagId: string; label: string }[]
  >([])

  const [categoryIdsForFilter, setCategoryIdsForFilter] =
    useCategorySelectionList()

  const queryInput = useMemo(() => {
    const x: RouterInput['posts']['search'] = {
      searchInput: inputPostSearchDebounced,
      includeTitle: inputIncludeTitle,
      includeSubtitle: inputIncludeSubtitle,
      includeSegmentsTitle: inputIncludeSegmentsTitle,
      includeSegmentsSubtitle: inputIncludeSegmentsSubtitle,
      tagIdsToFilter: tagsForFilter.map((tag) => tag.tagId),
      categoryIdsToFilter: categoryIdsForFilter,
    }
    return x
  }, [
    inputPostSearchDebounced,
    inputIncludeTitle,
    inputIncludeSubtitle,
    inputIncludeSegmentsTitle,
    inputIncludeSegmentsSubtitle,
    tagsForFilter,
    categoryIdsForFilter,
  ])

  const { data: postsSearchResult, isFetching } = trpc.posts.search.useQuery(
    queryInput,
    {
      enabled: isInputPostSearchValid,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  )

  // #############     URL SEARCH PARAMS
  useSyncSearchParamFromState({
    isEnabled: isInputPostSearchValid,
    searchParamKey: 's',
    value: inputPostSearchDebounced,
    pathname: router.pathname,
    push: router.push,
    query: router.query,
  })

  const [isSearchParamsInitialized, setIsSearchParamsInitialized] =
    useState(false)

  useEffect(() => {
    if (router.isReady && !isSearchParamsInitialized) {
      const searchInputFromParamsRaw = getSearchParam('s', router.query)
      if (searchInputFromParamsRaw) {
        setValue('searchInput', searchInputFromParamsRaw)
        resetField('searchInput', { defaultValue: searchInputFromParamsRaw })
        setIsSearchParamsInitialized(true)
      }
    }
  }, [
    router.query,
    router.isReady,
    isSearchParamsInitialized,
    resetField,
    setValue,
  ])

  return (
    <Page>
      <PageSection label="Search for posts">
        <div className="space-y-8">
          <div className="mx-auto my-12 w-full lg:w-1/2">
            <Form
              onSubmit={handleSubmitPostSearch(() => {
                // noop, this is executed via debounce above
              })}
            >
              <Input
                {...registerPostSearch('searchInput')}
                placeholder="What are you looking for?"
                isSpecial
                isLoading={isFetching}
                autoFocus={true}
                small
                validationErrorMessage={errorSearchInput?.message}
                icon={<IconSearch size="big" className="text-dprimary" />}
                textAlignCenter={true}
              />
            </Form>
          </div>
        </div>
      </PageSection>

      <PageSection hideTopMargin label="Search results">
        {postsSearchResult && (
          <PostsList
            initialViewVariant="short"
            posts={postsSearchResult.map((post) => ({
              id: post.id,
              categoryTitle: post.category.name,
              title: post.title,
              subtitle: post.subtitle,
              updatedAt: post.updatedAt,
              author: {
                id: post.authorId,
                username: post.author.username,
                imageId: post.author.imageId,
                imageBlurDataURL: post.author.imageBlurDataURL,
                imageFileExtension: post.author.imageFileExtension,
              },
              noOfViews: post.noOfViews,
              noOfComments: post._count.comments,
            }))}
          />
        )}
      </PageSection>

      <PageSection label="Filter your search">
        <div className="grid auto-rows-min grid-cols-4 gap-6">
          <Row label="By topic">
            <Form>
              <div className="flex flex-wrap gap-10">
                <InputCheckbox {...registerPostSearch('includeTitle')}>
                  Title
                </InputCheckbox>
                <InputCheckbox {...registerPostSearch('includeSubtitle')}>
                  Subtitle
                </InputCheckbox>
                <InputCheckbox {...registerPostSearch('includeSegmentsTitle')}>
                  Segment&apos;s title
                </InputCheckbox>
                <InputCheckbox
                  {...registerPostSearch('includeSegmentsSubtitle')}
                >
                  Segment&apos;s subtitle
                </InputCheckbox>
              </div>
            </Form>
          </Row>

          <Row label="By tags">
            <div className="space-y-4">
              <TagsList
                tags={tagsForFilter}
                onRemoveClick={(tagIdToRemove) => {
                  setTagsForFilter((prev) =>
                    prev.filter((tagPrev) => tagPrev.tagId !== tagIdToRemove),
                  )
                }}
              />

              <TagsSelection
                onAdd={(tagToAdd) =>
                  setTagsForFilter((prev) => {
                    if (
                      prev.some((tagPrev) => tagPrev.tagId === tagToAdd.tagId)
                    ) {
                      return prev
                    } else {
                      return [...prev, tagToAdd]
                    }
                  })
                }
                postCategoryId={null}
                tagsExisting={tagsForFilter}
              />

              <p className="mt-4 italic">
                Selecting no tag means every is included in the filter.
              </p>
            </div>
          </Row>

          <Row label="By category">
            <CategorySelectionList
              selectedIds={categoryIdsForFilter}
              setSelectedIds={setCategoryIdsForFilter}
            />
          </Row>
        </div>
      </PageSection>
    </Page>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: ReactNode
}): JSX.Element {
  return (
    <>
      <div className="col-span-full row-span-1 lg:col-span-1">
        <Subtitle>{label}</Subtitle>
      </div>
      <div className="col-span-full row-span-1 lg:col-span-3">{children}</div>
    </>
  )
}
