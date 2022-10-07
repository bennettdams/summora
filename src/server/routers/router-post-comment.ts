import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { t } from '../trpc'

const defaultPostCommentSelect = Prisma.validator<Prisma.PostCommentSelect>()({
  commentId: true,
  commentParentId: true,
  text: true,
  createdAt: true,
  upvotedBy: { select: { userId: true } },
  downvotedBy: true,
  author: {
    select: {
      userId: true,
      username: true,
      imageId: true,
      imageBlurDataURL: true,
    },
  },
})

export const postCommentsRouter = t.router({
  // READ
  byPostId: t.procedure
    .input(
      z.object({
        postId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { postId } = input

      const postComments = await ctx.prisma.postComment.findMany({
        where: { postId },
        select: defaultPostCommentSelect,
        orderBy: { upvotedBy: { _count: 'asc' } },
      })

      return postComments
    }),
})
