import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ensureAuthorTRPC } from '../../lib/api-security'
import {
  schemaCreatePostSegmentItem,
  schemaUpdatePostSegment,
} from '../../lib/schemas'
import { ContextTRPC } from '../context-trpc'
import { t } from '../trpc'

const defaultPostSegmentSelect = Prisma.validator<Prisma.PostSegmentSelect>()({
  id: true,
  createdAt: true,
  title: true,
  subtitle: true,
  imageId: true,
  items: {
    select: { id: true, content: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
})

async function ensureAuthor(ctx: ContextTRPC, postSegmentId: string) {
  await ensureAuthorTRPC({
    topic: 'post segments',
    ctx,
    cbQueryEntity: async () => {
      const postSegment = await ctx.prisma.postSegment.findUnique({
        where: { id: postSegmentId },
        select: { Post: { select: { authorId: true } } },
      })
      if (!postSegment?.Post.authorId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The post segment does not exist.',
        })
      } else {
        return { authorId: postSegment.Post.authorId, entity: null }
      }
    },
  })
}

export const postSegmentsRouter = t.router({
  // READ BY POST
  byPostId: t.procedure
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
  edit: t.procedure
    .input(schemaUpdatePostSegment)
    .mutation(async ({ input, ctx }) => {
      const { postSegmentId, title, subtitle } = input

      await ensureAuthor(ctx, postSegmentId)

      await ctx.prisma.postSegment.update({
        where: { id: postSegmentId },
        data: { title, subtitle },
      })
    }),
  // CREATE ITEM
  createItem: t.procedure
    .input(schemaCreatePostSegmentItem)
    .mutation(async ({ input, ctx }) => {
      const { segmentId, content } = input

      await ensureAuthor(ctx, segmentId)

      await ctx.prisma.postSegment.update({
        where: { id: segmentId },
        data: {
          items: { create: { content } },
        },
      })
    }),
  // DELETE
  delete: t.procedure
    .input(
      z.object({
        segmentId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { segmentId } = input

      await ensureAuthor(ctx, segmentId)

      await ctx.prisma.postSegment.delete({ where: { id: segmentId } })
    }),
})
