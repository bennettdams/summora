import { PostSegmentImagePosition, Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  schemaCreatePostSegmentItem,
  schemaUpdatePostSegment,
} from '../../lib/schemas'
import { ensureAuthorTRPC } from '../api-security'
import { deletePostSegmentImageInStorage } from '../cloud-storage'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostSegmentSelect = {
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
} satisfies Prisma.PostSegmentSelect

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
          post: { select: { authorId: true, id: true } },
        },
      })
      if (!postSegment?.post.authorId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The post segment does not exist.',
        })
      } else {
        return { authorId: postSegment.post.authorId, entity: postSegment }
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
      }),
    )
    .query(async ({ input, ctx }) => {
      const { postId } = input

      return await ctx.prisma.postSegment.findMany({
        where: { postId },
        select: defaultPostSegmentSelect,
        orderBy: {
          createdAt: 'asc',
        },
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
      }),
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
      }),
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
          post: { id: postId },
        } = res

        /*
         * TODO
         * This execution setup means that if deleting the images fails for whatever reason,
         * the segment will still be deleted. It is more important for the user to delete the
         * segment, so we need to take care of removing "dead" images separately.
         */
        if (imageId) {
          await deletePostSegmentImageInStorage({
            postId,
            postSegmentId: segmentId,
          })
        }

        await ctx.prisma.postSegment.delete({ where: { id: segmentId } })
      }
    }),
})
