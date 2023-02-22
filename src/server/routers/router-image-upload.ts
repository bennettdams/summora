import { createPresignedPost } from '../cloud-storage'
import { protectedProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { schemaImageFileType } from '../../lib/schemas'
import {
  extractFileExtensionFromFileType,
  storageImagesPath,
} from '../../services/cloud-service'
import { ensureAuthorTRPC } from '../api-security'


export const imageUploadRouter = router({
  // AVATAR
  getPresignedUrlAvatar: protectedProcedure
    .input(
      z.object({
        fileType: schemaImageFileType,
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

      return await createPresignedPost({
        fileType,
        storageImagePath: storageImagesPath.avatar({
          userId: ctx.userIdAuth,
          fileExtension,
        }),
      })
    }),
  // POST SEGMENT IMAGE
  getPresignedUrlPostSegmentImage: protectedProcedure
    .input(
      z.object({
        postSegmentId: z.string().cuid(),
        fileType: schemaImageFileType,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postSegmentId, fileType } = input

      const postForPostSegment = await ensureAuthorTRPC({
        topic: 'post segments',
        userIdAuth: ctx.userIdAuth,
        cbQueryEntity: async () => {
          const postSegment = await ctx.prisma.postSegment.findUnique({
            where: { id: postSegmentId },
            select: {
              Post: { select: { authorId: true, id: true } },
            },
          })
          if (!postSegment?.Post.authorId) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'The post segment does not exist.',
            })
          } else {
            return { authorId: postSegment.Post.authorId, entity: postSegment }
          }
        },
      })

      const fileExtension = extractFileExtensionFromFileType(fileType)

      await ctx.prisma.postSegment.update({
        where: { id: postSegmentId },
        data: {
          imageId: String(Date.now()),
          imageFileExtension: fileExtension,
        },
        select: null,
      })

      return await createPresignedPost({
        fileType,
        storageImagePath: storageImagesPath.postSegmentImage({
          postId: postForPostSegment.Post.id,
          postSegmentId,
          fileExtension,
        }),
      })
    }),
})
