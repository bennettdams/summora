import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostLikesSelect = Prisma.validator<Prisma.PostSelect>()({
  likedBy: { select: { userId: true } },
})

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
