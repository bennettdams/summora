import { Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '../../../../prisma/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserByCookie } from '../../../../services/auth-service'
import { logAPI } from '../../../../util/logger'

export type ApiPostCommentDownvote = Prisma.PromiseReturnType<
  typeof downvotePostComment
>

// TODO can this be done in one operation instead of two?
async function downvotePostComment({
  prisma,
  commentId,
  userId,
}: {
  prisma: PrismaClient
  commentId: string
  userId: string
}) {
  try {
    const isAlreadyDownvoted = await prisma.postComment.findFirst({
      where: { commentId, downvotedBy: { some: { userId } } },
    })

    // same query, only difference is "connect" & "disconnect"
    if (isAlreadyDownvoted) {
      const postCommentVotedUpdated = await prisma.postComment.update({
        where: {
          commentId,
        },
        data: {
          downvotedBy: {
            disconnect: { userId },
          },
        },
        include: {
          author: {
            select: { username: true, imageId: true, imageBlurDataURL: true },
          },
          upvotedBy: { select: { userId: true } },
          downvotedBy: { select: { userId: true } },
        },
      })

      return postCommentVotedUpdated
    } else {
      const postCommentVotedUpdated = await prisma.postComment.update({
        where: {
          commentId,
        },
        data: {
          upvotedBy: {
            disconnect: { userId },
          },
          downvotedBy: {
            connect: { userId },
          },
        },
        include: {
          author: {
            select: { username: true, imageId: true, imageBlurDataURL: true },
          },
          upvotedBy: { select: { userId: true } },
          downvotedBy: { select: { userId: true } },
        },
      })

      return postCommentVotedUpdated
    }
  } catch (error) {
    console.error(
      `Error while downvoting post comment ID ${commentId} for user ID ${userId}:`,
      error
    )
  }
}

export default async function _apiDownvotePostComment(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { commentId },
    method,
  } = req
  logAPI('POST_COMMENT_DOWNVOTE', method)

  if (!commentId) {
    res.status(500).end('No post comment ID!')
  } else if (typeof commentId !== 'string') {
    res.status(500).end('Post comment ID wrong format!')
  } else {
    const { userAuth } = await getUserByCookie(req)

    if (!userAuth) {
      res.status(401).end('Not signed in!')
    } else {
      switch (method) {
        case 'PUT': {
          const postCommentVotedUpdated: ApiPostCommentDownvote =
            await downvotePostComment({
              prisma,
              commentId: commentId,
              userId: userAuth.id,
            })

          res.status(200).json(postCommentVotedUpdated)
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
