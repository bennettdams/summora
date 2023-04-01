import { useState, type ReactNode } from 'react'
import { trpc } from '../../util/trpc'
import { Button } from '../Button'
import { ChoiceSelect, useChoiceSelect } from '../ChoiceSelect'
import { IconView } from '../Icon'
import { LoadingAnimation } from '../LoadingAnimation'
import { NoContent } from '../NoContent'
import { Page, PageSection } from '../Page'
import {
  CategorySelectionList,
  useCategorySelectionList,
} from '../category-selection'
import { PostsList } from '../post'
import { TagsList, TagsSelection } from '../tag'
import { Subtitle } from '../typography'

function Choice({
  label,
  children,
}: {
  label: string
  children: ReactNode
}): JSX.Element {
  return (
    <div className="flex flex-col items-start space-y-4">
      <Subtitle>{label}</Subtitle>
      {children}
    </div>
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

export function ExplorePage(): JSX.Element {
  const choiceSelectControlMetric = useChoiceSelect(
    [
      {
        choiceId: 'likes',
        label: 'Likes',
      },
      {
        choiceId: 'views',
        label: 'Views',
      },
    ],
    'likes'
  )

  const choiceSelectControlTimeRange = useChoiceSelect(
    [
      {
        choiceId: 'day',
        label: 'Day',
      },
      {
        choiceId: 'week',
        label: 'Week',
      },
      {
        choiceId: 'month',
        label: 'Month',
      },
    ],
    'week'
  )

  const [tagsForFilter, setTagsForFilter] = useState<
    { tagId: string; label: string }[]
  >([])

  const [categoryIdsForFilter, setCategoryIdsForFilter] =
    useCategorySelectionList()

  const {
    data: topPostsByLikes,
    isLoading: isLoadingTopLikes,
    isError: isErrorTopLikes,
  } = trpc.posts.topByLikes.useQuery({
    dateFromPast: choiceSelectControlTimeRange.selected.choiceId,
    tagIdsToFilter: tagsForFilter.map((tag) => tag.tagId),
    categoryIdsToFilter: categoryIdsForFilter,
  })
  const {
    data: topPostsByViews,
    isLoading: isLoadingTopViews,
    isError: isErrorTopViews,
  } = trpc.posts.topByViews.useQuery({
    dateFromPast: choiceSelectControlTimeRange.selected.choiceId,
    tagIdsToFilter: tagsForFilter.map((tag) => tag.tagId),
    categoryIdsToFilter: categoryIdsForFilter,
  })

  const [showFilters, setShowFilters] = useState(false)

  return (
    <Page>
      <PageSection>
        <div className="mx-auto flex max-w-sm flex-col space-y-4">
          <Choice label="Time range:">
            <ChoiceSelect control={choiceSelectControlTimeRange} />
          </Choice>
          <Choice label="Metric:">
            <ChoiceSelect control={choiceSelectControlMetric} />
          </Choice>
          <Choice label="Tags & categories:">
            <div>
              <Button
                onClick={() => setShowFilters((prev) => !prev)}
                icon={<IconView />}
              >
                {showFilters ? 'Hide' : 'Show'} filters
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row">
              <p>Selected tags:</p>

              <div className="flex-1 lg:ml-4">
                <TagsList
                  tags={tagsForFilter}
                  onRemoveClick={(tagIdToRemove) => {
                    setTagsForFilter((prev) =>
                      prev.filter((tagPrev) => tagPrev.tagId !== tagIdToRemove)
                    )
                  }}
                />
              </div>
            </div>
          </Choice>
        </div>

        {showFilters && (
          <div className="mt-8 grid max-w-7xl auto-rows-min grid-cols-4 gap-6">
            <Row label="By tags">
              <div className="space-y-4">
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
        )}
      </PageSection>

      {choiceSelectControlMetric.selected.choiceId === 'likes' ? (
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
      ) : choiceSelectControlMetric.selected.choiceId === 'views' ? (
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
      ) : (
        <p>Unknown choice.</p>
      )}
    </Page>
  )
}
