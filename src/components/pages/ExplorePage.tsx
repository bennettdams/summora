import { ExplorePageProps } from '../../pages/explore'
import { Box } from '../Box'
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

export function ExplorePage({
  postsViews,
  postsLikes,
}: ExplorePageProps): JSX.Element {
  return (
    <Page>
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
            },
            noOfViews: post.noOfViews,
            segments: [],
            tags: [],
            noOfComments: 0,
            noOfLikes: 0,
            likedBy: [],
            // noOfComments: post._count?.comments ?? 0,
            // noOfLikes: post.noOfLikes,
            // likedBy: post.likedBy,
          }))}
        />
      </PageSection>

      <PageSection label="Top 5 posts by likes">
        <ul>
          {postsLikes.map((post) => (
            <li key={post.id}>
              <PostExplorePage title={post.title} noOfX={post.noOfLikes} />
            </li>
          ))}
        </ul>
      </PageSection>
    </Page>
  )
}
