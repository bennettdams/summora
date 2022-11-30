import { Prisma } from '@prisma/client'
import { prisma } from '../server/db/client'

export type DbFindPosts = Prisma.PromiseReturnType<typeof dbFindPosts>
export async function dbFindPosts() {
  try {
    return await prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { username: true, imageId: true, imageBlurDataURL: true },
        },
        category: true,
        _count: { select: { comments: true, likedBy: true } },
      },
    })
  } catch (error) {
    throw new Error(`Error finding posts: ${error}`)
  }
}

/** Reusable `post include` statement, e.g. for "find" or "update" methods. */
export const postInclude = Prisma.validator<Prisma.PostInclude>()({
  category: true,
  author: {
    select: {
      username: true,
      imageId: true,
      imageBlurDataURL: true,
    },
  },
  segments: {
    orderBy: { createdAt: 'asc' },
    include: { items: { orderBy: { createdAt: 'asc' } } },
  },
  _count: {
    select: {
      comments: true,
    },
  },
})
