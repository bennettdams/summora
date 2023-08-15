import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { schemaUpdatePostSegmentItem } from '../../lib/schemas'
import { ensureAuthorTRPC } from '../api-security'
import { ContextTRPC } from '../context-trpc'
import { protectedProcedure, router } from '../trpc'

const defaultPostSegmentItemSelect = {
  id: true,
  createdAt: true,
  content: true,
} satisfies Prisma.PostSegmentItemSelect

async function ensureAuthor({
  userIdAuth,
  prisma,
  segmentItemId,
}: {
  userIdAuth: string
  prisma: ContextTRPC['prisma']
  segmentItemId: string
}) {
  await ensureAuthorTRPC({
    topic: 'post segment items',
    userIdAuth,
    cbQueryEntity: async () => {
      const segmentItem = await prisma.postSegmentItem.findUnique({
        where: { id: segmentItemId },
        select: {
          postSegment: {
            select: {
              post: {
                select: { authorId: true },
              },
            },
          },
        },
      })

      const postAuthorId = segmentItem?.postSegment.post.authorId
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

export const postSegmentItemsRouter = router({
  // UPDATE
  update: protectedProcedure
    .input(schemaUpdatePostSegmentItem)
    .mutation(async ({ input, ctx }) => {
      const { segmentItemId, content } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        segmentItemId,
      })

      await ctx.prisma.postSegmentItem.update({
        where: { id: segmentItemId },
        data: {
          content,
        },
        select: defaultPostSegmentItemSelect,
      })
    }),
  // DELETE
  delete: protectedProcedure
    .input(
      z.object({
        segmentItemId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { segmentItemId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        segmentItemId,
      })

      await ctx.prisma.postSegmentItem.delete({ where: { id: segmentItemId } })
    }),
})
