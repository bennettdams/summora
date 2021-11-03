import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { Prisma } from '@prisma/client'
import { logAPI } from '../../../util/logger'

export type ApiPosts = Prisma.PromiseReturnType<typeof findPost>
export type ApiPostsUpdate = Prisma.PromiseReturnType<typeof updatePost>

/**
 * @throws if post not found
 */
async function findPost(postId: string) {
  const post = await prisma.post.findUnique({
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

  if (!post) throw new Error(`Post ${postId} not found.`)

  return post
}

async function updatePost({ postId, postToUpdate }: PostUpdate) {
  const now = new Date()

  if (typeof postId !== 'string')
    throw new Error('Post ID is missing/in the wrong format!')

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
          include: {
            items: { orderBy: { createdAt: 'asc' } },
          },
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
        let post

        try {
          post = await findPost(postId)
        } catch (error) {
          const message = `Post ${postId} not found.`
          console.error(message)
          res.status(404).json({ message })
        }

        res.status(200).json(post)
        break
      }
      case 'PUT': {
        const { postId, postToUpdate }: PostUpdate = JSON.parse(requestBody)

        if (!postId) {
          res.status(404).end('No post ID!')
        } else {
          const postUpdated = await updatePost({
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
