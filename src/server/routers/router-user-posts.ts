import { z } from 'zod'
import { t } from '../trpc'

export const userPostsRouter = t.router({
  // READ
  byUserId: t.procedure
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
        include: {
          author: {
            select: {
              username: true,
              imageId: true,
              imageBlurDataURL: true,
            },
          },
          category: true,
          segments: { orderBy: { createdAt: 'asc' } },
          tags: { select: { id: true, label: true } },
          _count: { select: { comments: true, likedBy: true } },
          likedBy: { select: { userId: true } },
        },
      })
    }),
})
