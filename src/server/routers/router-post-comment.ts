import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { checkAuthTRPC, ensureAuthorTRPC } from '../../lib/api-security'
import { ContextTRPC } from '../context-trpc'
import { t } from '../trpc'

const defaultPostCommentSelect = Prisma.validator<Prisma.PostCommentSelect>()({
  commentId: true,
  commentParentId: true,
  text: true,
  isDeleted: true,
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

async function ensureAuthor(ctx: ContextTRPC, commentId: string) {
  await ensureAuthorTRPC({
    topic: 'post comment',
    ctx,
    cbQueryEntity: async () => {
      const res = await ctx.prisma.postComment.findUnique({
        where: { commentId },
        select: {
          authorId: true,
        },
      })
      if (!res?.authorId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The post comment you tried to update does not exist.',
        })
      } else {
        return { authorId: res.authorId, entity: null }
      }
    },
  })
}

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
  // CREATE
  create: t.procedure
    .input(
      z.object({
        postId: z.string().cuid(),
        // null for root comments
        commentParentId: z.string().cuid().nullable(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId, commentParentId, text } = input

      const userIdAuth = await checkAuthTRPC(ctx)

      await ctx.prisma.postComment.create({
        data: {
          Post: { connect: { id: postId } },
          author: { connect: { userId: userIdAuth } },
          commentParent: {
            connect: { commentId: commentParentId ?? undefined },
          },
          text,
        },
      })
    }),
  delete: t.procedure
    .input(
      z.object({
        commentId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input

      await ensureAuthor(ctx, commentId)

      await ctx.prisma.postComment.update({
        where: { commentId },
        data: { text: '', isDeleted: true },
      })
    }),
})
