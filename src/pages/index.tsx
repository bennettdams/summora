import { GetStaticProps } from 'next'
import { prisma } from '../prisma/prisma'
import { PostCategory, Prisma, PrismaClient } from '@prisma/client'
import { PostsPage } from '../components/pages/posts/PostsPage'

export interface PostsPageProps {
  posts: Exclude<Prisma.PromiseReturnType<typeof findPosts>, null>
  postCategories: PostCategory[]
  noOfPostsCreatedLast24Hours: number
}

async function findPosts(prisma: PrismaClient) {
  return await prisma.post.findMany({
    take: 20,
    include: { category: true, segments: { orderBy: { createdAt: 'asc' } } },
  })
}

export const getStaticProps: GetStaticProps<PostsPageProps> = async () => {
  const posts = await findPosts(prisma)
  const postCategories = await prisma.postCategory.findMany()

  const now = new Date()
  const nowYesterday = new Date(now.setHours(now.getHours() - 24))
  const noOfPostsCreatedLast24Hours = await prisma.post.count({
    where: { createdAt: { gte: nowYesterday } },
  })

  return {
    props: {
      posts,
      postCategories,
      noOfPostsCreatedLast24Hours,
    },
    revalidate: 2, // seconds
    // revalidate: 60 * 2, // seconds
  }
}

const Home = ({
  posts,
  postCategories,
  noOfPostsCreatedLast24Hours,
}: PostsPageProps): JSX.Element => {
  return (
    <PostsPage
      posts={posts}
      postCategories={postCategories}
      noOfPostsCreatedLast24Hours={noOfPostsCreatedLast24Hours}
    />
  )
}

export default Home
