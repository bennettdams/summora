import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/prisma'

function getRandom<T>(arr: T[]) {
  const min = 0
  const max = Math.floor(arr.length)
  return arr[Math.floor(Math.random() * (max - min) + min)]
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
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

    posts.forEach(async (post) => {
      const now = new Date().getTime()
      const step = 100

      await prisma.post.create({
        data: {
          ...post,
          category: {
            connect: {
              id: getRandom(postCategoriesCreated).id,
            },
          },
          tags: {
            connect: [
              { id: getRandom(postTagsCreated).id },
              { id: getRandom(postTagsCreated).id },
              { id: getRandom(postTagsCreated).id },
              { id: getRandom(postTagsCreated).id },
              { id: getRandom(postTagsCreated).id },
            ],
          },
          segments: {
            create: [
              {
                createdAt: new Date(now + 1 * step),
                title: 'Segment title 1',
                subtitle: 'Subtitle 1',
                // segmentNo: 1,
                items: {
                  create: [
                    {
                      createdAt: new Date(now + 2 * step),
                      content: 'Item content 1',
                      // itemNo: 1
                    },
                    {
                      createdAt: new Date(now + 3 * step),
                      content: 'Item content 2',
                      // itemNo: 2
                    },
                  ],
                },
              },
              {
                createdAt: new Date(now + 4 * step),
                title: 'Segment title 2',
                subtitle: 'Subtitle 2',
                // segmentNo: 2,
                items: {
                  create: [
                    {
                      createdAt: new Date(now + 5 * step),
                      content: 'Item content 1',
                      //  itemNo: 1
                    },
                    {
                      createdAt: new Date(now + 6 * step),
                      content: 'Item content 2',
                      // itemNo: 2
                    },
                  ],
                },
              },
            ],
          },
        },
      })
    })

    res.status(200).json(`seeded ${posts.length} posts`)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong!' + err })
  }
}

const posts: Prisma.PostCreateWithoutCategoryInput[] = [...new Array(10)].map(
  (_, i) => {
    const post: Prisma.PostCreateWithoutCategoryInput = {
      title:
        'Post title    This is a title that is a bit longer for testing purposes ' +
        (i + 1),
      subtitle:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + (i + 1),
    }
    return post
  }
)

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
  { title: 'Tutorial', description: '..' },
  { title: 'Summary', description: '..' },
  { title: 'How-to', description: '..' },
  { title: 'Knowledge', description: '..' },
  { title: 'Legal', description: '..' },
  {
    title: 'Everyday life',
    description: '..',
  },
  { title: 'For dummies', description: '..' },
  { title: 'History', description: '..' },
]
