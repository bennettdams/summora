import type { ReactNode } from 'react'
import { trpc } from '../../util/trpc'
import { ChoiceSelect, useChoiceSelect } from '../ChoiceSelect'
import { LoadingAnimation } from '../LoadingAnimation'
import { NoContent } from '../NoContent'
import { Page, PageSection } from '../Page'
import { PostsList } from '../post'
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

  const {
    data: topPostsByLikes,
    isLoading: isLoadingTopLikes,
    isError: isErrorTopLikes,
  } = trpc.posts.topByLikes.useQuery({
    dateFromPast: choiceSelectControlTimeRange.selected.choiceId,
  })
  const {
    data: topPostsByViews,
    isLoading: isLoadingTopViews,
    isError: isErrorTopViews,
  } = trpc.posts.topByViews.useQuery({
    dateFromPast: choiceSelectControlTimeRange.selected.choiceId,
  })

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
        </div>
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
