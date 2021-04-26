import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/prisma'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    await prisma.postSegmentItem.deleteMany({})
    await prisma.postSegment.deleteMany({})
    await prisma.post.deleteMany({})

    // posts.forEach(async (post) => {
    //   await prisma.post.create({
    //     data: {
    //       ...post,
    //       segments: {
    //         createMany: {
    //           data: segments,
    //         },
    //       },
    //     },
    //   })
    // })

    posts.forEach(async (post) => {
      await prisma.post.create({
        data: {
          ...post,
          segments: {
            create: [
              {
                title: 'Segment title 1',
                subtitle: 'Segment subtitle 1',
                // segmentNo: 1,
                items: {
                  create: [
                    {
                      content: 'Item content 1',
                      // itemNo: 1
                    },
                    {
                      content: 'Item content 2',
                      // itemNo: 2
                    },
                  ],
                },
              },
              {
                title: 'Segment title 2',
                subtitle: 'Segment subtitle 2',
                // segmentNo: 2,
                items: {
                  create: [
                    {
                      content: 'Item content 1',
                      //  itemNo: 1
                    },
                    {
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

    // const postSegments = await prisma.postSegment.findMany()
    // console.log('segment:s', postSegments.length)
    // postSegments.forEach(async (postSegment, index) => {
    //   await prisma.postSegment.update({
    //     where: { id: postSegment.id },
    //     data: {
    //       items: {
    //         createMany: {
    //           data: [
    //             { content: `#1 some item content ${postSegment.id} ${index}` },
    //             { content: `#2 some item content ${postSegment.id} ${index}` },
    //           ],
    //         },
    //       },
    //     },
    //     // works also:
    //     // data: { items: { create: { content: 'Some item content ' + index } } },
    //   })
    // })

    // res.status(200).json(posts)
    res.status(200).json(`seeded ${posts.length} posts`)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong!' + err })
  }
}

const posts: Prisma.PostCreateInput[] = [...new Array(3)].map((_, i) => {
  const post: Prisma.PostCreateInput = {
    title:
      'Post title    This is a title that is a bit longer for testing purposes ' +
      (i + 1),
    subtitle:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + (i + 1),
    category: 'Category A',
  }
  return post
})

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
