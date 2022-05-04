import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../prisma/prisma'
import { getUserByCookie } from '../../../../services/auth-service'
import { logAPI } from '../../../../util/logger'

export type ApiPostLikeUnlikePost = Prisma.PromiseReturnType<
  typeof likeUnlikePost
>

// TODO can this be done in one operation instead of two?
async function likeUnlikePost(postId: string, userId: string) {
  try {
    const isAlreadyLiked = await prisma.user.findFirst({
      where: { userId, likedPosts: { some: { id: postId } } },
    })

    // same query, only difference is "connect" & "disconnect"
    if (isAlreadyLiked) {
      const postLikedByUsersUpdated = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likedBy: {
            disconnect: { userId },
          },
        },
        // we include "authorId" so the mutation can sync the cache
        select: { authorId: true, likedBy: { select: { userId: true } } },
      })

      return postLikedByUsersUpdated
    } else {
      const postLikedByUsersUpdated = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likedBy: {
            connect: { userId },
          },
        },
        // we include "authorId" so the mutation can sync the cache
        select: { authorId: true, likedBy: { select: { userId: true } } },
      })

      return postLikedByUsersUpdated
    }
  } catch (error) {
    console.error(
      `Error while liking post ID ${postId} for user ID ${userId}:`,
      error
    )
  }
}

export default async function _apiLikeUnlikePost(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { postId },
    method,
  } = req
  logAPI('POST_LIKE_UNLIKE', method)

  if (!postId) {
    res.status(500).end('No post ID!')
  } else if (typeof postId !== 'string') {
    res.status(500).end('Post ID wrong format!')
  } else {
    const { userAuth } = await getUserByCookie(req)

    if (!userAuth) {
      res.status(401).end('Not signed in!')
    } else {
      switch (method) {
        case 'PUT': {
          const postLikedByUsersUpdated: ApiPostLikeUnlikePost =
            await likeUnlikePost(postId, userAuth.id)

          res.status(200).json(postLikedByUsersUpdated)
          break
        }
        default: {
          res.setHeader('Allow', ['PUT'])
          res.status(405).end(`Method ${method} Not Allowed`)
        }
      }
    }
  }
}
