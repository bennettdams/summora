import { createPresignedPost } from '../cloud-storage'
import { protectedProcedure, router } from '../trpc'
import { z } from 'zod'
import { extractFileExtensionFromFileType } from '../../services/cloud-service'


export const imageUploadRouter = router({
  // AVATAR
  getPresignedUrlAvatar: protectedProcedure
    .input(
      z.object({
        fileType: z.string().startsWith('image/'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileType } = input

      const fileExtension = extractFileExtensionFromFileType(fileType)

      await ctx.prisma.user.update({
        where: { id: ctx.userIdAuth },
        data: {
          imageId: String(Date.now()),
          imageFileExtension: fileExtension,
        },
        select: null,
      })

      return await createPresignedPost({ userId: ctx.userIdAuth, fileType })
    }),
})
