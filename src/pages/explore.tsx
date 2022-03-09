import { GetStaticProps } from 'next'
import { prisma } from '../prisma/prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { ExplorePage } from '../components/pages/ExplorePage'

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
        author: { select: { username: true, imageId: true } },
        category: { select: { title: true } },
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
        /*
         * TODO
         * Using _count for implicit Many-To-Many relations does not work right now (30.11.2021),
         * that's why we can't use it for "likedBy".
         * https://github.com/prisma/prisma/issues/9880
         */
        // take: 5,
        include: {
          likedBy: { select: { userId: true } },
          author: { select: { username: true, imageId: true } },
        },
      })
    )
      .sort((a, z) => z.likedBy.length - a.likedBy.length)
      .slice(0, 5)
      .map((post) => ({ ...post, noOfLikes: post.likedBy.length }))
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
