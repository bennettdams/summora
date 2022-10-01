import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { t } from '../trpc'

export const userRouter = t.router({
  // READ
  byUserId: t.procedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input

      const user = await ctx.prisma.user.findUnique({
        where: { userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No user for user ID '${userId}'`,
        })
      } else {
        return user
      }
    }),
})
