import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { AppMessage } from '../../lib/app-messages'
import { schemaEditUsername } from '../../lib/schemas'
import { ensureAuthorTRPC } from '../api-security'
import { deleteAvatarInStorage } from '../cloud-storage'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultUserSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  username: true,
  imageId: true,
  imageBlurDataURL: true,
  imageFileExtension: true,
} satisfies Prisma.UserSelect

async function ensureAuthor({
  userIdAuth,
  prisma,
  userId,
}: {
  userIdAuth: string
  prisma: ContextTRPC['prisma']
  userId: string
}) {
  return await ensureAuthorTRPC({
    topic: 'user',
    userIdAuth,
    cbQueryEntity: async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, imageFileExtension: true },
      })

      if (!user?.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The user does not exist.',
        })
      } else {
        return { authorId: user.id, entity: user }
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
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: defaultUserSelect,
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

      let message: AppMessage = 'ok'

      try {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { username },
        })
      } catch (error) {
        message = 'errorUniqueUsername'
      }

      return message
    }),
  // REMOVE AVATAR
  removeAvatar: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.userIdAuth

    const { imageFileExtension } = await ensureAuthor({
      userIdAuth: ctx.userIdAuth,
      prisma: ctx.prisma,
      userId,
    })

    if (!imageFileExtension) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `No image or file extension for user ID '${userId}'`,
      })
    } else {
      const res = await deleteAvatarInStorage(userId)

      if (res.ok) {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: {
            imageId: null,
            imageBlurDataURL: null,
            imageFileExtension: null,
          },
        })
      }
    }
  }),
})
