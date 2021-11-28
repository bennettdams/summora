import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../prisma/prisma'
import { logAPI } from '../../../../util/logger'

export type ApiPostIncrementViews = ReturnType<typeof incrementViews>

async function incrementViews(postId: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { noOfViews: { increment: 1 } },
  })
}

export default async function _incrementPostViewsAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postId },
    method,
  } = req
  logAPI('POST_INCREMENT_VIEWS', method)

  if (!postId) {
    res.status(500).end('No post ID!')
  } else if (typeof postId !== 'string') {
    res.status(500).end('Post ID wrong format!')
  } else {
    switch (method) {
      case 'PUT': {
        // deliberately done without await to not block the request
        incrementViews(postId)

        res.status(200).json({ message: `Post ${postId} views increased.` })
        break
      }
      default: {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
