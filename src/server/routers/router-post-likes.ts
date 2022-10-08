import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { checkAuthTRPC } from '../../lib/api-security'
import { t } from '../trpc'

const defaultPostLikesSelect = Prisma.validator<Prisma.PostSelect>()({
  likedBy: { select: { userId: true } },
})

export const postLikesRouter = t.router({
  // READ
  byPostId: t.procedure
    .input(
      z.object({
        postId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { postId } = input

      const res = await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: defaultPostLikesSelect,
      })

      if (!res) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post for post ID '${postId}'`,
        })
      } else {
        return res.likedBy
      }
    }),
  // LIKE/UNLIKE
  toggleLike: t.procedure
    .input(z.object({ postId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      const userIdAuth = await checkAuthTRPC(ctx)

      const isAlreadyLiked = await ctx.prisma.user.findFirst({
        where: { userId: userIdAuth, likedPosts: { some: { id: postId } } },
      })

      await ctx.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likedBy: isAlreadyLiked
            ? {
                disconnect: { userId: userIdAuth },
              }
            : {
                connect: { userId: userIdAuth },
              },
        },
      })
    }),
})
