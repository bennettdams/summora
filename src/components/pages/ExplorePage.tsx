import { trpc } from '../../util/trpc'
import { LoadingAnimation } from '../LoadingAnimation'
import { NoContent } from '../NoContent'
import { Page, PageSection } from '../Page'
import { PostsList } from '../post'

export function ExplorePage(): JSX.Element {
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

  return (
    <Page>
      {/* <PageSection label="Post of the day">
        <p>Some post..</p>
      </PageSection> */}

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
