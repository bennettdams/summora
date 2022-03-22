import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../prisma/prisma'
import { getUserByCookie } from '../../../../services/auth-service'
import { logAPI } from '../../../../util/logger'

export type ApiPostCommentDelete = boolean

async function deletePostComment(commentId: string) {
  try {
    return await prisma.postComment.delete({
      where: { commentId },
      select: null,
    })
  } catch (error) {
    throw new Error(`Error while deleting post comment: ${error}`)
  }
}

export default async function _apiPostComment(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { commentId },
    method,
  } = req
  logAPI('POST_COMMENT', method, `Post comment ID: ${commentId}`)

  if (!commentId) {
    res.status(500).end('No post comment ID!')
  } else if (typeof commentId !== 'string') {
    res.status(500).end('Post comment ID wrong format!')
  } else {
    const { data: user, error } = await getUserByCookie(req)

    if (!user || error) {
      res.status(401).json({ message: 'Not signed in' })
    } else {
      switch (method) {
        case 'DELETE': {
          const commentAuthor = await prisma.postComment.findUnique({
            rejectOnNotFound: true,
            where: { commentId },
            select: { authorId: true },
          })

          if (commentAuthor.authorId !== user.id) {
            res
              .status(403)
              .json({ message: "You're not the author of this comment." })
          } else {
            await deletePostComment(commentId)

            const apiResult: ApiPostCommentDelete = true

            res.status(200).json(apiResult)
          }
          break
        }
        default: {
          res.setHeader('Allow', ['DELETE'])
          res.status(405).end(`Method ${method} Not Allowed`)
        }
      }
    }
  }
}
