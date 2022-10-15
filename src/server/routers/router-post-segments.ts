import { Prisma } from '@prisma/client'
import { z } from 'zod'
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
})
