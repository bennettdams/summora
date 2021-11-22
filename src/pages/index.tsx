import { GetStaticProps } from 'next'
import { prisma } from '../prisma/prisma'
import { PostCategory, PrismaClient } from '@prisma/client'
import { PostsPage } from '../components/pages/posts/PostsPage'
import { hydrationHandler, prefillServer } from '../data/use-posts'
import { Hydrate } from 'react-query'
import { ServerPageProps } from '../types/PageProps'

export type PostsPageProps = {
  postCategories: PostCategory[]
  noOfPosts: number
  noOfPostsCreatedLast24Hours: number
}

const revalidateInSeconds = 5 * 60

async function findPosts(prisma: PrismaClient) {
  try {
    return await prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { username: true, hasAvatar: true } },
        category: true,
        segments: { orderBy: { createdAt: 'asc' } },
        tags: { select: { id: true, title: true } },
        _count: { select: { comments: true } },
      },
    })
  } catch (error) {
    throw new Error(`Error finding posts: ${error}`)
  }
}

export const getStaticProps: GetStaticProps<PostsPageProps & ServerPageProps> =
  async () => {
    const posts = await findPosts(prisma)

    const client = hydrationHandler.createClient()
    prefillServer(client, posts)

    const postCategories = await prisma.postCategory.findMany()

    const now = new Date()
    const nowYesterday = new Date(now.setHours(now.getHours() - 24))
    const noOfPosts = await prisma.post.count()
    const noOfPostsCreatedLast24Hours = await prisma.post.count({
      where: { createdAt: { gte: nowYesterday } },
    })

    return {
      props: {
        dehydratedState: hydrationHandler.dehydrate(client),
        postCategories,
        noOfPosts,
        noOfPostsCreatedLast24Hours,
      },
      revalidate: revalidateInSeconds,
    }
  }

export default function _HomePage(
  props: PostsPageProps & ServerPageProps
): JSX.Element {
  return (
    <Hydrate state={hydrationHandler.deserialize(props.dehydratedState)}>
      <PostsPage
        postCategories={props.postCategories}
        noOfPosts={props.noOfPosts}
        noOfPostsCreatedLast24Hours={props.noOfPostsCreatedLast24Hours}
      />
    </Hydrate>
  )
}
