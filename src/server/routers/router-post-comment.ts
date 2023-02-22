import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { schemaCreatePostComment } from '../../lib/schemas'
import { ensureAuthorTRPC } from '../api-security'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostCommentSelect = Prisma.validator<Prisma.PostCommentSelect>()({
  commentId: true,
  commentParentId: true,
  text: true,
  isDeleted: true,
  createdAt: true,
  upvotedBy: { select: { id: true } },
  downvotedBy: true,
  author: {
    select: {
      id: true,
      username: true,
      imageId: true,
      imageBlurDataURL: true,
      imageFileExtension: true,
    },
  },
})

async function ensureAuthor({
  userIdAuth,
  prisma,
  commentId,
}: {
  userIdAuth: string
  prisma: ContextTRPC['prisma']
  commentId: string
}) {
  await ensureAuthorTRPC({
    topic: 'post comment',
    userIdAuth,
    cbQueryEntity: async () => {
      const res = await prisma.postComment.findUnique({
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

export const postCommentsRouter = router({
  // READ
  byPostId: procedure
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
        orderBy: [
          { upvotedBy: { _count: 'desc' } },
          { downvotedBy: { _count: 'asc' } },
          { createdAt: 'asc' },
        ],
      })

      return postComments
    }),
  // CREATE
  create: protectedProcedure
    .input(schemaCreatePostComment)
    .mutation(async ({ input, ctx }) => {
      const { postId, commentParentId, text } = input

      await ctx.prisma.postComment.create({
        data: {
          Post: { connect: { id: postId } },
          author: { connect: { id: ctx.userIdAuth } },
          commentParent: !commentParentId
            ? undefined
            : {
                connect: { commentId: commentParentId },
              },
          text,
        },
      })
    }),
  // DELETE
  delete: protectedProcedure
    .input(
      z.object({
        commentId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        commentId,
      })

      await ctx.prisma.postComment.update({
        where: { commentId },
        data: { text: '', isDeleted: true },
      })
    }),
  // UPVOTE
  upvote: protectedProcedure
    .input(
      z.object({
        commentId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input
      const userIdAuth = ctx.userIdAuth

      const isAlreadyUpvoted = !!(await ctx.prisma.postComment.findFirst({
        where: { commentId, upvotedBy: { some: { id: userIdAuth } } },
      }))

      if (isAlreadyUpvoted) {
        await ctx.prisma.postComment.update({
          where: {
            commentId,
          },
          data: {
            upvotedBy: {
              disconnect: { id: userIdAuth },
            },
          },
        })
      } else {
        await ctx.prisma.postComment.update({
          where: {
            commentId,
          },
          data: {
            upvotedBy: {
              connect: { id: userIdAuth },
            },
            downvotedBy: {
              disconnect: { id: userIdAuth },
            },
          },
        })
      }
    }),
  // DOWNVOTE
  downvote: protectedProcedure
    .input(
      z.object({
        commentId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input
      const userIdAuth = ctx.userIdAuth

      const isAlreadyDownvoted = !!(await ctx.prisma.postComment.findFirst({
        where: { commentId, downvotedBy: { some: { id: userIdAuth } } },
      }))

      if (isAlreadyDownvoted) {
        await ctx.prisma.postComment.update({
          where: {
            commentId,
          },
          data: {
            downvotedBy: {
              disconnect: { id: userIdAuth },
            },
          },
        })
      } else {
        await ctx.prisma.postComment.update({
          where: {
            commentId,
          },
          data: {
            upvotedBy: {
              disconnect: { id: userIdAuth },
            },
            downvotedBy: {
              connect: { id: userIdAuth },
            },
          },
        })
      }
    }),
})
