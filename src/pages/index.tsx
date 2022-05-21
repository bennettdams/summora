import { GetStaticProps } from 'next'
import { prisma } from '../prisma/prisma'
import { PostsPage } from '../components/pages/posts/PostsPage'
import { hydrationHandler, prefillServer } from '../data/use-posts'
import {
  prefillServer as prefillServerCategories,
  hydrationHandler as hydrationHandlerCategories,
} from '../data/use-post-categories'
import { Hydrate } from 'react-query'
import { ServerPageProps } from '../types/PageProps'
import { ApiPosts } from './api/posts'
import { dbFindPostCategories, dbFindPosts } from '../lib/db'

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

  const client = hydrationHandler.createClient()
  prefillServer(client, posts)

  const clientCategories = hydrationHandlerCategories.createClient()
  const postCategories = await dbFindPostCategories()
  prefillServerCategories(clientCategories, postCategories)

  const now = new Date()
  const nowYesterday = new Date(now.setHours(now.getHours() - 24))

  const noOfPosts = await prisma.post.count()
  const noOfComments = await prisma.postComment.count()
  const noOfPostsCreatedLast24Hours = await prisma.post.count({
    where: { createdAt: { gte: nowYesterday } },
  })
  const noOfCommentsCreatedLast24Hours = await prisma.postComment.count({
    where: { createdAt: { gte: nowYesterday } },
  })

  return {
    props: {
      dehydratedState: hydrationHandler.dehydrate(client),
      dehydratedState2: hydrationHandlerCategories.dehydrate(clientCategories),
      postCategories,
      noOfPosts,
      noOfPostsCreatedLast24Hours,
      noOfComments,
      noOfCommentsCreatedLast24Hours,
    },
    revalidate: revalidateInSeconds,
  }
}

export default function _HomePage(props: Props): JSX.Element {
  return (
    <Hydrate state={hydrationHandler.deserialize(props.dehydratedState)}>
      <Hydrate
        state={hydrationHandlerCategories.deserialize(props.dehydratedState2)}
      >
        <PostsPage
          noOfPosts={props.noOfPosts}
          noOfPostsCreatedLast24Hours={props.noOfPostsCreatedLast24Hours}
          noOfComments={props.noOfComments}
          noOfCommentsCreatedLast24Hours={props.noOfCommentsCreatedLast24Hours}
        />
      </Hydrate>
    </Hydrate>
  )
}
