import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/prisma'

export type DbFindUser = Prisma.PromiseReturnType<typeof dbFindUser>
export async function dbFindUser(userId: string) {
  return await prisma.user.findUnique({
    where: {
      userId,
    },
  })
}

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

export type DbFindPost = Prisma.PromiseReturnType<typeof dbFindPost>
export async function dbFindPost(postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      category: true,
      tags: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      author: {
        select: { username: true, imageId: true, imageBlurDataURL: true },
      },
      segments: {
        orderBy: { createdAt: 'asc' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      },
      comments: {
        include: {
          author: {
            select: { username: true, imageId: true, imageBlurDataURL: true },
          },
          upvotedBy: { select: { userId: true } },
          downvotedBy: { select: { userId: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      likedBy: { select: { userId: true } },
    },
  })
}

export type DbFindUserPosts = Prisma.PromiseReturnType<typeof dbFindUserPosts>
export async function dbFindUserPosts(userId: string) {
  try {
    return await prisma.post.findMany({
      where: { authorId: userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
            imageId: true,
            imageBlurDataURL: true,
          },
        },
        category: { select: { title: true } },
        segments: { orderBy: { createdAt: 'asc' } },
        tags: { select: { id: true, title: true } },
        /*
         * TODO
         * Using _count for implicit Many-To-Many relations does not work right now (30.11.2021),
         * that's why we can't use it for "likedBy".
         * https://github.com/prisma/prisma/issues/9880
         */
        // _count: { select: { comments: true, likedBy: true } },
        _count: { select: { comments: true } },
        likedBy: { select: { userId: true } },
      },
    })
  } catch (error) {
    throw new Error(`Error finding posts for user ${userId}: ${error}`)
  }
}
