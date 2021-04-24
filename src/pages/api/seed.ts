import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/prisma'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    await prisma.post.deleteMany({})
    await prisma.postSegment.deleteMany({})

    posts.forEach(async (post, index) => {
      await prisma.post.create({
        data: {
          ...post,
          segments: {
            create: [
              {
                title: `segment ${index} title`,
                subtitle: `segment ${index} subtitle`,
              },
              {
                title: `segment ${index} title`,
                subtitle: `segment ${index} subtitle`,
              },
              {
                title: `segment ${index} title`,
                subtitle: `segment ${index} subtitle`,
              },
              {
                title: `segment ${index} title`,
                subtitle: `segment ${index} subtitle`,
              },
            ],
          },
        },
      })
    })

    // res.status(200).json(posts)
    res.status(200)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
}

const posts: Prisma.PostCreateInput[] = [...new Array(11)].map((_, i) => {
  const post: Prisma.PostCreateInput = {
    title:
      'This is a title that is a bit longer for testing purposes ' + (i + 1),
    subtitle:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + (i + 1),
    category: 'Category A',
  }
  return post
})
