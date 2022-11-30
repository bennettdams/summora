import { z } from 'zod'
import { procedure, router } from '../trpc'

export const userPostsRouter = router({
  // READ
  byUserId: procedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input

      return await ctx.prisma.post.findMany({
        where: { authorId: userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          subtitle: true,
          noOfViews: true,
          updatedAt: true,
          authorId: true,
          category: {
            select: {
              name: true,
            },
          },
          author: {
            select: {
              username: true,
              imageId: true,
              imageBlurDataURL: true,
            },
          },
          segments: { orderBy: { createdAt: 'asc' } },
          _count: { select: { comments: true, likedBy: true } },
        },
      })
    }),
})
