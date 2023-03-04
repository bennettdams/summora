import { useMemo } from 'react'
import { z } from 'zod'
import { schemaPostSearch } from '../../lib/schemas'
import { ExplorePageProps } from '../../pages/explore'
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

function PostExplorePage({
  title,
  noOfX,
}: {
  title: string
  noOfX: number
}): JSX.Element {
  return (
    <Box padding="small">
      <p>{title}</p>
      <p>{noOfX}</p>
    </Box>
  )
}

type SchemaPostSearch = z.infer<typeof schemaPostSearch>

export function ExplorePage({
  postsViews,
  postsLikes,
}: ExplorePageProps): JSX.Element {
  const {
    data: postCategories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = trpc.postCategories.all.useQuery()

  const defaultValuesPostSearch: SchemaPostSearch = useMemo(
    () => ({ searchInput: '' }),
    []
  )
  const {
    handleSubmit: handleSubmitPostSearch,
    register: registerPostSearch,
    watch: watchPostSearch,
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
  const { data: postsSearchResult, isFetching } = trpc.posts.search.useQuery(
    { searchInput: inputPostSearchDebounced },
    {
      enabled:
        !!inputPostSearchDebounced &&
        inputPostSearchDebounced.length >=
          (schemaPostSearch.shape.searchInput.minLength ?? 2),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

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

          <div>
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
          </div>
        </div>
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
        <p>Post abc</p>
      </PageSection>

      <PageSection label="Post of the day">
        <div className="flex space-x-4">
          {postsViews.map((post) => (
            <div key={post.id} className="flex-1">
              <PostExplorePage title={post.title} noOfX={post.noOfViews} />
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection label="Top 5 posts by views">
        <PostsList
          posts={postsViews.map((post) => ({
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
            noOfComments: 0,
            // noOfComments: post._count?.comments ?? 0,
          }))}
        />
      </PageSection>

      <PageSection label="Top 5 posts by likes">
        <ul>
          {postsLikes.map((post) => (
            <li key={post.id}>
              <PostExplorePage title={post.title} noOfX={post._count.likedBy} />
            </li>
          ))}
        </ul>
      </PageSection>
    </Page>
  )
}
