import { GetStaticProps } from 'next'
import { prisma } from '../prisma/prisma'
import { PostCategory, PrismaClient } from '@prisma/client'
import { PostsPage } from '../components/pages/posts/PostsPage'
import { hydrationHandler, prefillServer } from '../data/use-posts'
import { Hydrate } from 'react-query'
import { ServerPageProps } from '../types/PageProps'
import { ApiPosts } from './api/posts'

export type PostsPageProps = {
  postCategories: PostCategory[]
  noOfPosts: number
  noOfComments: number
  noOfPostsCreatedLast24Hours: number
  noOfCommentsCreatedLast24Hours: number
}

const revalidateInSeconds = 5 * 60

async function findPosts(prisma: PrismaClient) {
  try {
    return await prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { username: true, imageId: true, imageBlurDataURL: true },
        },
        category: true,
        segments: { orderBy: { createdAt: 'asc' } },
        tags: { select: { id: true, title: true } },
        /*
         * TODO
         * Using _count for implicit Many-To-Many relations does not work right now,
         * that's why we can't use it for "likedBy".
         * Prisma v3.12.0
         * https://github.com/prisma/prisma/issues/9880
         */
        // _count: { select: { comments: true, likedBy: true } },
        _count: { select: { comments: true } },
        likedBy: { select: { userId: true } },
      },
    })
  } catch (error) {
    throw new Error(`Error finding posts: ${error}`)
  }
}

export const getStaticProps: GetStaticProps<
  PostsPageProps & ServerPageProps
> = async () => {
  const posts: ApiPosts = (await findPosts(prisma)).map((post) => ({
    ...post,
    noOfLikes: post.likedBy.length,
  }))

  const client = hydrationHandler.createClient()
  prefillServer(client, posts)

  const postCategories = await prisma.postCategory.findMany()

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
      postCategories,
      noOfPosts,
      noOfPostsCreatedLast24Hours,
      noOfComments,
      noOfCommentsCreatedLast24Hours,
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
        noOfComments={props.noOfComments}
        noOfCommentsCreatedLast24Hours={props.noOfCommentsCreatedLast24Hours}
      />
    </Hydrate>
  )
}
