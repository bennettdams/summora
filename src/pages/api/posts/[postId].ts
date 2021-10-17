import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { Prisma } from '@prisma/client'
import { logAPI } from '../../../util/logger'

export type PostPostAPI = Exclude<
  Prisma.PromiseReturnType<typeof findPost>,
  null
>
export type PostSegmentPostAPI = PostPostAPI['segments'][number]
export type PostSegmentItemPostAPI = PostSegmentPostAPI['items'][number]

export interface PostUpdate {
  postId: string
  postToUpdate: Prisma.PostUpdateWithoutSegmentsInput & {
    categoryId: string
    tagIds: string[]
  }
}

async function findPost(postId: string) {
  try {
    return await prisma.post.findUnique({
      where: { id: postId },
      include: {
        segments: {
          orderBy: { createdAt: 'asc' },
          include: { items: { orderBy: { createdAt: 'asc' } } },
        },
        category: true,
        tags: true,
      },
    })
  } catch (error) {
    throw new Error(`Error while finding post: ${error}`)
  }
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
          res.status(404).json({ message: `Cannot find post for id ${postId}` })
        } else {
          res.status(200).json(post)
        }
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
