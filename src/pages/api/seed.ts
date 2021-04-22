import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/prisma'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    await prisma.post.deleteMany({})

    posts.forEach(async (post) => {
      await prisma.post.create({ data: post })
    })
    res.status(200).json(posts)
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong' })
  }
}

const posts: Prisma.PostCreateInput[] = [...new Array(11)].map((_, i) => ({
  title: 'Title ' + (i + 1),
  subtitle:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + (i + 1),
  content:
    'Vestibulum aliquam, lorem in laoreet facilisis, sapien augue varius velit, nec mollis sem augue vel mauris. Ut aliquet, augue eu fringilla tincidunt, dui massa sodales erat, id imperdiet neque metus sit amet urna. In vitae eros a massa tincidunt placerat. Donec vehicula nisi et erat dapibus condimentum.' +
    (i + 1),
  createdAt: new Date().toISOString(),
}))
