import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { schemaEditUsername } from '../../lib/schemas'
import { avatarImageIdPrefix } from '../../pages/api/image-upload/avatars'
import { deleteAvatarInStorage } from '../../services/use-cloud-storage'
import { ensureAuthorTRPC } from '../api-security'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

async function ensureAuthor({
  userIdAuth,
  prisma,
  userId,
}: {
  userIdAuth: string
  prisma: ContextTRPC['prisma']
  userId: string
}) {
  await ensureAuthorTRPC({
    topic: 'user',
    userIdAuth,
    cbQueryEntity: async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })

      if (!user?.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The user does not exist.',
        })
      } else {
        return { authorId: user.id, entity: null }
      }
    },
  })
}

export const userRouter = router({
  // READ
  byUserId: procedure
    .input(
      z.object({
        userId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
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
  // EDIT USERNAME
  editUsername: protectedProcedure
    .input(schemaEditUsername)
    .mutation(async ({ input, ctx }) => {
      const { userId, username } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        userId,
      })

      await ctx.prisma.user.update({
        where: { id: userId },
        data: { username },
      })
    }),
  // REMOVE AVATAR
  removeAvatar: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        // min. 8:   avatar prefix + ID etc.
        imageId: z.string().startsWith(avatarImageIdPrefix).min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, imageId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        userId,
      })

      await deleteAvatarInStorage({
        userId,
        imageId,
        req: ctx.req,
        res: ctx.res,
      })

      await ctx.prisma.user.update({
        where: { id: userId },
        data: { imageId: null, imageBlurDataURL: null },
      })
    }),
})
