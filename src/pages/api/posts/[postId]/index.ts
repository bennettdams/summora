import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { dbFindPost, DbFindPost, postInclude } from '../../../../lib/db'
import { prisma } from '../../../../prisma/prisma'
import { ApiPostUpdateRequestBody } from '../../../../services/api-service'
import { logAPI } from '../../../../util/logger'

export type ApiPost = DbFindPost
export type ApiPostUpdate = Prisma.PromiseReturnType<typeof updatePost>

async function updatePost(
  postId: string,
  postToUpdate: ApiPostUpdateRequestBody
) {
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
        title: postToUpdate.title,
        subtitle: postToUpdate.subtitle,
        category: !postToUpdate.categoryId
          ? undefined
          : {
              connect: {
                id: postToUpdate.categoryId,
              },
            },
      },
      // same `include` as the usual "get post" fetcher so we can use the same React Query type
      include: postInclude,
    })
  } catch (error) {
    throw new Error(`Error while updating post with ID ${postId}: ${error}`)
  }
}

export default async function _apiPost(
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
        const post: ApiPost = await dbFindPost(postId)

        if (!post) {
          res.status(404).json({ message: `Post ${postId} not found.` })
        } else {
          res.status(200).json(post)
        }
        break
      }
      case 'PUT': {
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
