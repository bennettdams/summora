import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ensureAuthorTRPC } from '../../lib/api-security'
import { t } from '../trpc'

const defaultPostTagsSelect = Prisma.validator<Prisma.PostTagSelect>()({
  tagId: true,
  label: true,
})

export const postTagsRouter = t.router({
  // READ
  byPostId: t.procedure
    .input(z.object({ postId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const { postId } = input
      const tagsForPost = await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: { tags: { select: defaultPostTagsSelect } },
      })

      if (!tagsForPost) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The post ID does not exist.',
        })
      } else {
        return tagsForPost.tags
      }
    }),
  popularOverall: t.procedure.query(async ({ ctx }) => {
    return await ctx.prisma.postTag.findMany({
      select: {
        tagId: true,
        label: true,
      },
      orderBy: { posts: { _count: 'desc' } },
      take: 20,
    })
  }),
  popularByCategoryId: t.procedure
    .input(z.object({ categoryId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const { categoryId } = input
      return await ctx.prisma.postTag.findMany({
        select: {
          tagId: true,
          label: true,
        },
        where: { posts: { some: { postCategoryId: categoryId } } },
        orderBy: { posts: { _count: 'desc' } },
        take: 20,
      })
    }),
})
