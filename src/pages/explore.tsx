import { Prisma, PrismaClient } from '@prisma/client'
import { GetStaticProps } from 'next'
import { ExplorePage } from '../components/pages/ExplorePage'
import { prisma } from '../prisma/prisma'

export type ExplorePageProps = {
  postsViews: Prisma.PromiseReturnType<typeof findPostsViews>
  postsLikes: Prisma.PromiseReturnType<typeof findPostsLikes>
}

const revalidateInSeconds = 5 * 60

async function findPostsViews(prisma: PrismaClient) {
  try {
    return await prisma.post.findMany({
      take: 5,
      orderBy: { noOfViews: 'desc' },
      include: {
        author: {
          select: { username: true, imageId: true, imageBlurDataURL: true },
        },
        category: { select: { name: true } },
      },
    })
  } catch (error) {
    throw new Error(`Error finding posts: ${error}`)
  }
}

async function findPostsLikes(prisma: PrismaClient) {
  try {
    return (
      await prisma.post.findMany({
        // take: 5,
        include: {
          _count: { select: { likedBy: true } },
          author: { select: { username: true, imageId: true } },
        },
      })
    )
      .sort((a, z) => z._count.likedBy - a._count.likedBy)
      .slice(0, 5)
  } catch (error) {
    throw new Error(`Error finding posts: ${error}`)
  }
}

export const getStaticProps: GetStaticProps<ExplorePageProps> = async () => {
  const postsViews = await findPostsViews(prisma)
  const postsLikes = await findPostsLikes(prisma)

  return {
    props: {
      postsViews: JSON.parse(JSON.stringify(postsViews)),
      postsLikes: JSON.parse(JSON.stringify(postsLikes)),
    },
    revalidate: revalidateInSeconds,
  }
}

export default function _ExplorePage(props: ExplorePageProps): JSX.Element {
  return (
    <ExplorePage
      postsViews={props.postsViews.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }))}
      postsLikes={props.postsLikes.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }))}
    />
  )
}
