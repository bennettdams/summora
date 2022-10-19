import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ensureAuthorTRPC } from '../../lib/api-security'
import { schemaUpdatePostSegmentItem } from '../../lib/schemas'
import { ContextTRPC } from '../context-trpc'
import { t } from '../trpc'

const defaultPostSegmentItemSelect =
  Prisma.validator<Prisma.PostSegmentItemSelect>()({
    id: true,
    createdAt: true,
    content: true,
  })

async function ensureAuthor(ctx: ContextTRPC, segmentItemId: string) {
  await ensureAuthorTRPC({
    topic: 'post segment items',
    ctx,
    cbQueryEntity: async () => {
      const segmentItem = await ctx.prisma.postSegmentItem.findUnique({
        where: { id: segmentItemId },
        select: {
          PostSegment: {
            select: {
              Post: {
                select: { authorId: true },
              },
            },
          },
        },
      })

      const postAuthorId = segmentItem?.PostSegment.Post.authorId
      if (!postAuthorId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The post segment item does not exist.',
        })
      } else {
        return { authorId: postAuthorId, entity: null }
      }
    },
  })
}

export const postSegmentItemsRouter = t.router({
  // UPDATE
  update: t.procedure
    .input(schemaUpdatePostSegmentItem)
    .mutation(async ({ input, ctx }) => {
      const { segmentItemId, content } = input

      await ensureAuthor(ctx, segmentItemId)

      await ctx.prisma.postSegmentItem.update({
        where: { id: segmentItemId },
        data: {
          content,
        },
        select: defaultPostSegmentItemSelect,
      })
    }),
  // DELETE
  delete: t.procedure
    .input(
      z.object({
        segmentItemId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { segmentItemId } = input

      await ensureAuthor(ctx, segmentItemId)

      await ctx.prisma.postSegmentItem.delete({ where: { id: segmentItemId } })
    }),
})
