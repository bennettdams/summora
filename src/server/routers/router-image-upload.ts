import { createPresignedPost } from '../cloud-storage'
import { protectedProcedure, router } from '../trpc'
import { z } from 'zod'


export const imageUploadRouter = router({
  // AVATAR
  getPresignedUrlAvatar: protectedProcedure
    .input(
      z.object({
        fileType: z.string().startsWith('image/'),
      })
    )
    .mutation(async ({ input }) => {
      const { fileType } = input

      return await createPresignedPost(fileType)
    }),
})
