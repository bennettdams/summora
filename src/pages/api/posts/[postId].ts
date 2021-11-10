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
      category: true,
      tags: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      author: { select: { username: true, hasAvatar: true } },
      segments: {
        orderBy: { createdAt: 'asc' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })
}

async function updatePost(
  postId: string,
  postToUpdate: ApiPostUpdateRequestBody
) {
  const now = new Date()

  try {
    return await prisma.post.update({
      where: {
        id: postId,
      },
      /*
       * TODO maybe easier to just spread postToUpdate here, but not sure
       * how Prisma would handle the fields that are non-primitive (like "author")
       */
      data: {
        updatedAt: now,
        title: postToUpdate.title,
        subtitle: postToUpdate.subtitle,
        category: !postToUpdate.categoryId
          ? undefined
          : {
              connect: {
                id: postToUpdate.categoryId,
              },
            },
        tags: !postToUpdate.tagIds
          ? undefined
          : { set: postToUpdate.tagIds.map((tagId) => ({ id: tagId })) },
      },
      include: {
        category: true,
        tags: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        author: { select: { username: true, hasAvatar: true } },
        segments: {
          orderBy: { createdAt: 'asc' },
          include: { items: { orderBy: { createdAt: 'asc' } } },
        },
      },
    })
  } catch (error) {
    throw new Error(`Error while updating post with ID ${postId}: ${error}`)
  }
}

export default async function _postAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postId },
    body: requestBody,
    method,
  } = req

  logAPI('POST', method, `Post ID: ${postId}`)

  if (!postId) {
    res.status(500).end('No post ID!')
  } else if (typeof postId !== 'string') {
    res.status(500).end('Post ID wrong format!')
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
        const postToUpdate: ApiPostUpdateRequestBody = requestBody

        const postUpdated: ApiPostUpdate = await updatePost(
          postId,
          postToUpdate
        )

        res.status(200).json(postUpdated)
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
