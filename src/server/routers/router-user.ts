import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ensureAuthorTRPC } from '../../lib/api-security'
import { avatarImageIdPrefix } from '../../pages/api/image-upload/avatars'
import { deleteAvatarInStorage } from '../../services/use-cloud-storage'
import { ContextTRPC } from '../context-trpc'
import { t } from '../trpc'

async function ensureAuthor(ctx: ContextTRPC, userId: string) {
  await ensureAuthorTRPC({
    topic: 'user',
    ctx,
    cbQueryEntity: async () => {
      const user = await ctx.prisma.user.findUnique({
        where: { userId },
        select: { userId: true },
      })

      if (!user?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The user does not exist.',
        })
      } else {
        return { authorId: user.userId, entity: null }
      }
    },
  })
}

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
  // REMOVE AVATAR
  removeAvatar: t.procedure
    .input(
      z.object({
        userId: z.string().uuid(),
        // min. 8:   avatar prefix + ID etc.
        imageId: z.string().startsWith(avatarImageIdPrefix).min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, imageId } = input

      if (!ctx.req || !ctx.res)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No request given, cannot determine authentication.',
        })

      await ensureAuthor(ctx, userId)

      await deleteAvatarInStorage({
        userId,
        imageId,
        req: ctx.req,
        res: ctx.res,
      })

      await ctx.prisma.user.update({
        where: { userId },
        data: { imageId: null, imageBlurDataURL: null },
      })
    }),
})
