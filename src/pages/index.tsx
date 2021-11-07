import { GetStaticProps } from 'next'
import { prisma } from '../prisma/prisma'
import { PostCategory, Prisma, PrismaClient } from '@prisma/client'
import { PostsPage } from '../components/pages/posts/PostsPage'

export interface PostsPageProps {
  posts: Prisma.PromiseReturnType<typeof findPosts>
  postCategories: PostCategory[]
  noOfPosts: number
  noOfPostsCreatedLast24Hours: number
}

async function findPosts(prisma: PrismaClient) {
  try {
    return await prisma.post.findMany({
      take: 20,
      include: {
        author: { select: { username: true, hasAvatar: true } },
        category: true,
        segments: { orderBy: { createdAt: 'asc' } },
      },
    })
  } catch (error) {
    throw new Error(`Error finding posts: ${error}`)
  }
}

export const getStaticProps: GetStaticProps<PostsPageProps> = async () => {
  const posts = await findPosts(prisma)
  const postCategories = await prisma.postCategory.findMany()

  const now = new Date()
  const nowYesterday = new Date(now.setHours(now.getHours() - 24))
  const noOfPosts = await prisma.post.count()
  const noOfPostsCreatedLast24Hours = await prisma.post.count({
    where: { createdAt: { gte: nowYesterday } },
  })

  return {
    props: {
      posts,
      postCategories,
      noOfPosts,
      noOfPostsCreatedLast24Hours,
    },
    revalidate: 10,
  }
}

export default function _HomePage(props: PostsPageProps): JSX.Element {
  return (
    <PostsPage
      posts={props.posts}
      postCategories={props.postCategories}
      noOfPosts={props.noOfPosts}
      noOfPostsCreatedLast24Hours={props.noOfPostsCreatedLast24Hours}
    />
  )
}
