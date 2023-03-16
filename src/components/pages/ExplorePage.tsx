import { useRouter } from 'next/router'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { schemaPostSearch } from '../../lib/schemas'
import { getSearchParam } from '../../services/router-service'
import { trpc, type RouterInput } from '../../util/trpc'
import { useDebounce } from '../../util/use-debounce'
import { useZodForm } from '../../util/use-zod-form'
import { Box } from '../Box'
import { Form, Input, InputCheckbox } from '../form'
import { IconSearch } from '../Icon'
import { LoadingAnimation } from '../LoadingAnimation'
import { NoContent } from '../NoContent'
import { Page, PageSection } from '../Page'
import { PostsList } from '../post'
import { TagsList, TagsSelection } from '../tag'

type SchemaPostSearch = z.infer<typeof schemaPostSearch>

export function ExplorePage(): JSX.Element {
  const {
    data: postCategories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = trpc.postCategories.all.useQuery()

  const {
    data: topPostsByLikes,
    isLoading: isLoadingTopLikes,
    isError: isErrorTopLikes,
  } = trpc.posts.topByLikes.useQuery()
  const {
    data: topPostsByViews,
    isLoading: isLoadingTopViews,
    isError: isErrorTopViews,
  } = trpc.posts.topByViews.useQuery()

  const router = useRouter()

  const defaultValuesPostSearch: SchemaPostSearch = useMemo(
    () => ({
      searchInput: '',
      tagIdsToFilter: [],
      includeTitle: true,
      includeSubtitle: true,
      includeSegmentsTitle: true,
      includeSegmentsSubtitle: true,
    }),
    []
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
    mode: 'onSubmit',
  })
  const inputPostSearch = watchPostSearch('searchInput')
  const inputPostSearchDebounced = useDebounce(inputPostSearch, 500)
  const inputIncludeTitle = watchPostSearch('includeTitle')
  const inputIncludeSubtitle = watchPostSearch('includeSubtitle')
  const inputIncludeSegmentsTitle = watchPostSearch('includeSegmentsTitle')
  const inputIncludeSegmentsSubtitle = watchPostSearch(
    'includeSegmentsSubtitle'
  )

  const isInputPostSearchValid =
    !!inputPostSearchDebounced &&
    inputPostSearchDebounced.length >=
      (schemaPostSearch.shape.searchInput.minLength ?? 2)

  const [tagsForFilter, setTagsForFilter] = useState<
    { tagId: string; label: string }[]
  >([])

  const queryInput = useMemo(() => {
    const x: RouterInput['posts']['search'] = {
      searchInput: inputPostSearchDebounced,
      tagIdsToFilter: tagsForFilter.map((tag) => tag.tagId),
      includeTitle: inputIncludeTitle,
      includeSubtitle: inputIncludeSubtitle,
      includeSegmentsTitle: inputIncludeSegmentsTitle,
      includeSegmentsSubtitle: inputIncludeSegmentsSubtitle,
    }
    return x
  }, [
    inputPostSearchDebounced,
    tagsForFilter,
    inputIncludeTitle,
    inputIncludeSubtitle,
    inputIncludeSegmentsTitle,
    inputIncludeSegmentsSubtitle,
  ])

  const { data: postsSearchResult, isFetching } = trpc.posts.search.useQuery(
    queryInput,
    {
      enabled: isInputPostSearchValid,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

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

            {!postsSearchResult ? (
              <p className="mt-2">&nbsp;</p>
            ) : (
              <p className="mt-2 italic tracking-wide text-dprimary">
                Found {postsSearchResult.length} posts.
              </p>
            )}
          </div>
        </div>
      </PageSection>

      <PageSection label="Filter your search" hideTopMargin>
        <div className="grid auto-rows-min grid-cols-4 gap-6">
          <Row label="By topic">
            <Form>
              <div className="space-x-10">
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
                    prev.filter((tagPrev) => tagPrev.tagId !== tagIdToRemove)
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
            </div>
          </Row>

          <Row label="By category">
            {isLoadingCategories ? (
              <div className="grid place-items-center">
                <LoadingAnimation />
              </div>
            ) : isErrorCategories ? (
              <NoContent>Error while loading categories.</NoContent>
            ) : !postCategories || postCategories.length === 0 ? (
              <NoContent>No post categories found.</NoContent>
            ) : (
              <div className="grid grid-cols-2 gap-6 text-center text-lg md:grid-cols-4">
                {postCategories.map((category) => (
                  <Box padding="small" key={category.id}>
                    <span>{category.name}</span>
                  </Box>
                ))}
              </div>
            )}
          </Row>
        </div>
      </PageSection>

      <PageSection label="Search results">
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

      <PageSection label="Post of the day">
        <p>Some post..</p>
      </PageSection>

      <PageSection label="Top 5 posts by views">
        {isLoadingTopViews ? (
          <div className="grid place-items-center">
            <LoadingAnimation />
          </div>
        ) : isErrorTopViews ? (
          <NoContent>Error while loading posts.</NoContent>
        ) : !topPostsByViews || topPostsByViews.length === 0 ? (
          <NoContent>No posts found.</NoContent>
        ) : (
          <PostsList
            posts={topPostsByViews.map((post) => ({
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

      <PageSection label="Top 5 posts by likes">
        {isLoadingTopLikes ? (
          <div className="grid place-items-center">
            <LoadingAnimation />
          </div>
        ) : isErrorTopLikes ? (
          <NoContent>Error while loading posts.</NoContent>
        ) : !topPostsByLikes || topPostsByLikes.length === 0 ? (
          <NoContent>No posts found.</NoContent>
        ) : (
          <PostsList
            posts={topPostsByLikes.map((post) => ({
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
      <div className="col-span-1 row-span-1">
        <p className="ml-20 text-3xl font-semibold uppercase tracking-widest text-dsecondary">
          {label}
        </p>
      </div>
      <div className="col-span-3 row-span-1">{children}</div>
    </>
  )
}
