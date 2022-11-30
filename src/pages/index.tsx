import { GetStaticProps } from 'next'
import { PostsPage } from '../components/pages/posts/PostsPage'
import {
  hydrationHandler as hydrationHandlerPosts,
  prefillServer as prefillServerPosts,
} from '../data/use-posts'
import { dbFindPosts } from '../lib/db'
import { prisma } from '../server/db/client'
import { ServerPageProps } from '../types/PageProps'
import { ApiPosts } from './api/posts'

export type PostsPageProps = {
  noOfPosts: number
  noOfComments: number
  noOfPostsCreatedLast24Hours: number
  noOfCommentsCreatedLast24Hours: number
}

const revalidateInSeconds = 5 * 60

type Props = PostsPageProps &
  ServerPageProps & { dehydratedState2: ServerPageProps['dehydratedState'] }

export const getStaticProps: GetStaticProps<
  PostsPageProps & ServerPageProps
> = async () => {
  const posts: ApiPosts = await dbFindPosts()

  const client = hydrationHandlerPosts.createClient()
  prefillServerPosts(client, posts)

  const now = new Date()
  const nowYesterday = new Date(now.setHours(now.getHours() - 24))

  const [
    noOfPosts,
    noOfComments,
    noOfPostsCreatedLast24Hours,
    noOfCommentsCreatedLast24Hours,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.postComment.count(),
    prisma.post.count({
      where: { createdAt: { gte: nowYesterday } },
    }),
    prisma.postComment.count({
      where: { createdAt: { gte: nowYesterday } },
    }),
  ])

  return {
    props: {
      dehydratedState: hydrationHandlerPosts.dehydrate(client),
      noOfPosts,
      noOfPostsCreatedLast24Hours,
      noOfComments,
      noOfCommentsCreatedLast24Hours,
    },
    revalidate: revalidateInSeconds,
  }
}

const HydratePosts = hydrationHandlerPosts.Hydrate

export default function _HomePage(props: Props): JSX.Element {
  return (
    <HydratePosts dehydratedState={props.dehydratedState}>
      <PostsPage
        noOfPosts={props.noOfPosts}
        noOfPostsCreatedLast24Hours={props.noOfPostsCreatedLast24Hours}
        noOfComments={props.noOfComments}
        noOfCommentsCreatedLast24Hours={props.noOfCommentsCreatedLast24Hours}
      />
    </HydratePosts>
  )
}
