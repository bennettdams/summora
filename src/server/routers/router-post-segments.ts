import { PostSegmentImagePosition, Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  schemaCreatePostSegmentItem,
  schemaUpdatePostSegment,
} from '../../lib/schemas'
import { deletePostSegmentImageInStorage } from '../../services/use-cloud-storage'
import { ensureAuthorTRPC } from '../api-security'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostSegmentSelect = Prisma.validator<Prisma.PostSegmentSelect>()({
  id: true,
  createdAt: true,
  title: true,
  subtitle: true,
  imageId: true,
  imageFileExtension: true,
  position: true,
  items: {
    select: { id: true, content: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
})

async function ensureAuthor({
  userIdAuth,
  prisma,
  postSegmentId,
}: {
  userIdAuth: string
  prisma: ContextTRPC['prisma']
  postSegmentId: string
}) {
  return await ensureAuthorTRPC({
    topic: 'post segments',
    userIdAuth,
    cbQueryEntity: async () => {
      const postSegment = await prisma.postSegment.findUnique({
        where: { id: postSegmentId },
        select: {
          imageId: true,
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
}

export const postSegmentsRouter = router({
  // READ BY POST
  byPostId: procedure
    .input(
      z.object({
        postId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { postId } = input

      return await ctx.prisma.postSegment.findMany({
        where: { postId },
        select: defaultPostSegmentSelect,
      })
    }),
  // EDIT
  edit: protectedProcedure
    .input(schemaUpdatePostSegment)
    .mutation(async ({ input, ctx }) => {
      const { postSegmentId, title, subtitle } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postSegmentId,
      })

      await ctx.prisma.postSegment.update({
        where: { id: postSegmentId },
        data: { title, subtitle },
      })
    }),
  // CHANGE IMAGE POSITION
  changeImagePosition: protectedProcedure
    .input(
      z.object({
        postSegmentId: z.string().cuid(),
        position: z.nativeEnum(PostSegmentImagePosition),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postSegmentId, position } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postSegmentId,
      })

      await ctx.prisma.postSegment.update({
        where: { id: postSegmentId },
        data: { position },
      })
    }),
  // CREATE ITEM
  createItem: protectedProcedure
    .input(schemaCreatePostSegmentItem)
    .mutation(async ({ input, ctx }) => {
      const { segmentId, content } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postSegmentId: segmentId,
      })

      await ctx.prisma.postSegment.update({
        where: { id: segmentId },
        data: {
          items: { create: { content } },
        },
      })
    }),
  // DELETE
  delete: protectedProcedure
    .input(
      z.object({
        segmentId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { segmentId } = input

      const res = await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postSegmentId: segmentId,
      })

      if (res) {
        const {
          imageId,
          Post: { authorId, id: postId },
        } = res

        // Delete the segment image in cloud storage
        if (imageId) {
          await deletePostSegmentImageInStorage({
            postId,
            authorId,
            imageId,
            req: ctx.req,
            res: ctx.res,
          })
        }

        await ctx.prisma.postSegment.delete({ where: { id: segmentId } })
      }
    }),
})
