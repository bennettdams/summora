import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostLikesSelect = {
  likedBy: { select: { id: true } },
} satisfies Prisma.PostSelect

export const postLikesRouter = router({
  // READ
  byPostId: procedure
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
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      const userIdAuth = ctx.userIdAuth

      const isAlreadyLiked = await ctx.prisma.user.findFirst({
        where: { id: userIdAuth, likedPosts: { some: { id: postId } } },
      })

      await ctx.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likedBy: isAlreadyLiked
            ? {
                disconnect: { id: userIdAuth },
              }
            : {
                connect: { id: userIdAuth },
              },
        },
      })
    }),
})
