import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { ApiPostCommentCreateRequestBody } from '../../../services/api-service'
import { getUserByCookie } from '../../../services/auth-service'
import { logAPI } from '../../../util/logger'

export type ApiPostCommentCreate = Prisma.PromiseReturnType<
  typeof createPostComment
>

async function createPostComment(
  postId: string,
  commentParentId: string | null,
  authorId: string,
  postCommentToCreate: ApiPostCommentCreateRequestBody['postCommentToCreate']
) {
  try {
    return await prisma.postComment.create({
      data: {
        postId,
        authorId,
        commentParentId,
        text: postCommentToCreate.text,
      },
      include: {
        author: { select: { username: true, imageId: true } },
        upvotedBy: { select: { userId: true } },
        downvotedBy: { select: { userId: true } },
      },
    })
  } catch (error) {
    throw new Error(`Error while creating post comment: ${error}`)
  }
}

export default async function _apiPostComments(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req
  logAPI('POST_COMMENTS', method)

  const { data: user, error } = await getUserByCookie(req)

  if (!user || error) {
    res.status(401).json({ message: 'Not signed in' })
  } else {
    switch (method) {
      case 'POST': {
        // TODO parse needed?
        const {
          postId,
          commentParentId,
          postCommentToCreate,
        }: ApiPostCommentCreateRequestBody = requestBody

        const postCommentCreated: ApiPostCommentCreate =
          await createPostComment(
            postId,
            commentParentId,
            user.id,
            postCommentToCreate
          )

        res.status(200).json(postCommentCreated)
        break
      }
      default: {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
