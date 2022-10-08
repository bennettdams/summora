import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/prisma'
import { ApiPostsCreateRequestBody } from '../services/api-service'

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
        tags: { select: { id: true, label: true } },
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
  tags: {
    select: {
      id: true,
      label: true,
      description: true,
    },
  },
  author: {
    select: {
      username: true,
      imageId: true,
      imageBlurDataURL: true,
      donationLinks: {
        select: {
          donationLinkId: true,
          address: true,
          donationProvider: {
            select: { donationProviderId: true, name: true },
          },
        },
      },
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

export type DbFindPost = Prisma.PromiseReturnType<typeof dbFindPost>
export async function dbFindPost(postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: postInclude,
  })
}

export type DbCreatePost = Prisma.PromiseReturnType<typeof dbCreatePost>
export async function dbCreatePost(
  userId: string,
  postToCreate: ApiPostsCreateRequestBody['postToCreate']
) {
  try {
    return await prisma.post.create({
      data: {
        title: postToCreate.title,
        subtitle: postToCreate.subtitle,
        // connect
        author: { connect: { userId } },
        category: { connect: { id: postToCreate.categoryId } },
      },
      include: postInclude,
    })
  } catch (error) {
    throw new Error(`Error while creating post: ${error}`)
  }
}

export type DbFindPostCategories = Prisma.PromiseReturnType<
  typeof dbFindPostCategories
>
export async function dbFindPostCategories() {
  try {
    return await prisma.postCategory.findMany()
  } catch (error) {
    throw new Error(`Error finding post categories: ${error}`)
  }
}
