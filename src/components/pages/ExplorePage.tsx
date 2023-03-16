import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { schemaPostSearch } from '../../lib/schemas'
import { getSearchParam } from '../../services/router-service'
import { trpc } from '../../util/trpc'
import { useDebounce } from '../../util/use-debounce'
import { useZodForm } from '../../util/use-zod-form'
import { Box } from '../Box'
import { Form, Input } from '../form'
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

  const isInputPostSearchValid =
    !!inputPostSearchDebounced &&
    inputPostSearchDebounced.length >=
      (schemaPostSearch.shape.searchInput.minLength ?? 2)

  const [tagsForFilter, setTagsForFilter] = useState<
    { tagId: string; label: string }[]
  >([])

  const { data: postsSearchResult, isFetching } = trpc.posts.search.useQuery(
    {
      searchInput: inputPostSearchDebounced,
      tagIdsToFilter: tagsForFilter.map((tag) => tag.tagId),
    },
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
          </div>

          <Box>
            <p>Filter by topic..</p>
            <div className="space-x-4">
              <span>Title</span>
              <span>Subtitle</span>
              <span>Tags</span>
              <span>Post segments&apos; title</span>
              <span>Post segments&apos; subtitle</span>
            </div>
          </Box>
        </div>
      </PageSection>

      <PageSection label="Include tags for filter" hideTopMargin>
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
                if (prev.some((tagPrev) => tagPrev.tagId === tagToAdd.tagId)) {
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
      </PageSection>

      <PageSection>
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

      <PageSection label="Find by category">
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
