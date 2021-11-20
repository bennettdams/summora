import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/prisma'

function getRandomNumberForRange(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomElementOfArray<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default async function _seedAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    await prisma.postSegmentItem.deleteMany({})
    await prisma.postSegment.deleteMany({})
    await prisma.post.deleteMany({})
    await prisma.postCategory.deleteMany({})
    await prisma.postTag.deleteMany({})

    await prisma.postCategory.createMany({ data: postCategories })
    const postCategoriesCreated = await prisma.postCategory.findMany()

    await prisma.postTag.createMany({ data: postTags })
    const postTagsCreated = await prisma.postTag.findMany()

    const users = await prisma.user.findMany()

    await prisma.post.createMany({
      data: [...new Array(100)].map((_, i) => {
        const category = getRandomElementOfArray(postCategoriesCreated)
        return {
          title: `${
            category.title
          } This is a title that is a bit longer for testing purposes ${i + 1}`,
          subtitle: `Subtitle - Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${
            i + 1
          }`,
          postCategoryId: category.id,
          authorId: getRandomElementOfArray(users).userId,
        }
      }),
    })

    const postsCreated = await prisma.post.findMany()
    postsCreated.forEach(async (post) => {
      await new Promise((r) => setTimeout(r, 10))
      await prisma.post.update({
        data: {
          tags: {
            connect: [...new Array(getRandomNumberForRange(1, 15))].map(() => ({
              id: getRandomElementOfArray(postTagsCreated).id,
            })),
          },
          segments: {
            create: createSegments(),
          },
        },
        where: { id: post.id },
      })
    })

    // const postsCreated = await posts.map(async (post) => {
    //   return await prisma.post.create({
    //     data: {
    //       ...post,
    // category: {
    //   connect: {
    //     id: getRandom(postCategoriesCreated).id,
    //   },
    // },
    // tags: {
    // connect: [...new Array(15)].map((_) => ({
    //   id: getRandom(postTagsCreated).id,
    // })),
    // },
    //     },
    //   })
    // })

    // postsCreated.forEach(postTemp => {
    //   await prisma.postSegment.createMany({ data: createSegments(postTemp.) })
    // })

    // segments: {
    // createMany: {
    //   data: createSegments(post.id),
    // },
    // },

    const message = `seeded ${postsCreated.length} posts`
    console.info(message)
    res.status(200).json(message)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong!' + err })
  }
}

// const posts: Prisma.PostCreateWithoutCategoryInput[] = [...new Array(100)].map(
//   (_, i) => {
//     const post: Prisma.PostCreateWithoutCategoryInput = {
//       title:
//         'Post title    This is a title that is a bit longer for testing purposes ' +
//         (i + 1),
//       subtitle:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + (i + 1),
//     }
//     return post
//   }
// )

// function createSegments(postId: string): Prisma.PostSegmentCreateManyInput[] {
function createSegments(): Prisma.PostSegmentCreateManyPostInput[] {
  return [...new Array(getRandomNumberForRange(1, 10))].map((_, index) => {
    const now = new Date().getTime()
    const step = 100

    // const postSegment: Prisma.PostSegmentCreateManyPostInput = {}

    return {
      createdAt: new Date(now + 1 * step),
      title: `Segment title ${index}`,
      subtitle: `Subtitle ${index}`,
      items: {
        create: Array.from({ length: getRandomNumberForRange(1, 10) }).map(
          (_, index) => ({
            createdAt: new Date(now + 1 * step),
            content: `Item content ${index}`,
          })
        ),
      },
    }
  })
}

// for inline create
// const segments: Prisma.PostSegmentCreateWithoutPostInput[] = [
//   ...new Array(2),
// ].map((_, i) => {
//   const segment: Prisma.PostSegmentCreateWithoutPostInput = {
//     title: 'Segment title ' + (i + 1),
//     subtitle:
//       'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + (i + 1),
//   }
//   return segment
// })

// const postIdsCreated: string[] = []
// posts.forEach(async (post) => {
//   const postCreated = await prisma.post.create({
//     data: {
//       ...post,
//     },
//   })
//   postIdsCreated.push(postCreated.id)
// })

// const postSegmentIdsCreated: string[] = []
// segments.forEach(async (segment) => {
//   const postSegmentCreated = await prisma.postSegment.create({
//     data: {
//       ...segment,
//     },
//   })
//   postSegmentIdsCreated.push(postSegmentCreated.id)
// })

export const postCategories: Prisma.PostCategoryCreateInput[] = [
  { id: 'books', title: 'Books', description: '..' },
  { id: 'movies', title: 'Movies', description: '..' },
  { id: 'series', title: 'Series', description: '..' },
  { id: 'music', title: 'Music', description: '..' },
  { id: 'gaming', title: 'Gaming', description: '..' },
  { id: 'pc-electronics', title: 'PC & Electronics', description: '..' },
  { id: 'household', title: 'Electronic', description: '..' },
  { id: 'animals', title: 'Animals', description: '..' },
  { id: 'nature', title: 'Nature', description: '..' },
  { id: 'beauty', title: 'Beauty', description: '..' },
  { id: 'vehicles', title: 'Vehicles', description: '..' },
  { id: 'food-drinks', title: 'Food & drinks', description: '..' },
  { id: 'education', title: 'Education', description: '..' },
  { id: 'babys', title: 'Babys', description: '..' },
  { id: 'fashion', title: 'Fashion', description: '..' },
  { id: 'sports', title: 'Sports', description: '..' },
]

export const postTags: Prisma.PostTagCreateWithoutPostsInput[] = [
  ...new Array(100),
].flatMap((_, i) => [
  { title: 'Tutorial' + i, description: '..' },
  { title: 'Summary' + i, description: '..' },
  { title: 'How-to' + i, description: '..' },
  { title: 'Knowledge' + i, description: '..' },
  { title: 'Legal' + i, description: '..' },
  {
    title: 'Everyday life' + i,
    description: '..',
  },
  { title: 'For dummies' + i, description: '..' },
  { title: 'History' + i, description: '..' },
])
