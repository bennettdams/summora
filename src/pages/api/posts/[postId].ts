import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { Prisma } from '@prisma/client'
import { logAPI } from '../../../util/logger'
import { ApiPostUpdateRequestBody } from '../../../services/api-service'

export type ApiPost = Prisma.PromiseReturnType<typeof findPost>
export type ApiPostUpdate = Prisma.PromiseReturnType<typeof updatePost>

async function findPost(postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      segments: {
        orderBy: { createdAt: 'asc' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      },
      author: true,
      category: true,
      tags: true,
    },
  })
}

async function updatePost({ postId, postToUpdate }: ApiPostUpdateRequestBody) {
  const now = new Date()

  try {
    return await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        updatedAt: now,
        title: postToUpdate.title,
        subtitle: postToUpdate.subtitle,
        category: {
          connect: {
            id: postToUpdate.categoryId,
          },
        },
        tags: { set: postToUpdate.tagIds.map((tagId) => ({ id: tagId })) },
      },
      include: {
        segments: {
          orderBy: { createdAt: 'asc' },
          include: { items: { orderBy: { createdAt: 'asc' } } },
        },
        author: true,
        category: true,
        tags: true,
      },
    })
  } catch (error) {
    throw new Error(`Error while updating post with ID ${postId}: ${error}`)
  }
}

export default async function _postsPostIDAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postId },
    body: requestBody,
    method,
  } = req

  logAPI('POSTS_POST_ID', method, `Post ID: ${postId}`)

  if (!postId) {
    res.status(404).end('No post ID!')
  } else if (typeof postId !== 'string') {
    res.status(400).end('Post ID wrong format!')
  } else {
    switch (method) {
      case 'GET': {
        const post = await findPost(postId)

        if (!post) {
          res.status(404).json({ message: `Post ${postId} not found.` })
        } else {
          res.status(200).json(post)
        }
        break
      }
      case 'PUT': {
        // TODO parse needed?
        const { postId, postToUpdate }: ApiPostUpdateRequestBody = requestBody

        if (!postId) {
          res.status(500).json({ message: 'No post ID!' })
        } else {
          const postUpdated: ApiPostUpdate = await updatePost({
            postId,
            postToUpdate,
          })

          res.status(200).json(postUpdated)
        }
        break
      }
      default: {
        res.setHeader('Allow', ['GET', 'PUT'])
        // res.status(405).json({ message: 'Method not allowed' })
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
