import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { schemaPostCategoryId, schemaTagSearch } from '../../lib/schemas'
import { ensureAuthorTRPC } from '../api-security'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostTagsSelect = {
  tagId: true,
  label: true,
} satisfies Prisma.PostTagSelect

async function ensureAuthor({
  userIdAuth,
  prisma,
  postId,
}: {
  userIdAuth: string
  prisma: ContextTRPC['prisma']
  postId: string
}) {
  await ensureAuthorTRPC({
    topic: 'post tag',
    userIdAuth,
    cbQueryEntity: async () => {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      })
      if (!post?.authorId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The post does not exist.',
        })
      } else {
        return { authorId: post.authorId, entity: null }
      }
    },
  })
}

export const postTagsRouter = router({
  // READ
  byPostId: procedure
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
  popularOverall: procedure.query(async ({ ctx }) => {
    return await ctx.prisma.postTag.findMany({
      select: {
        tagId: true,
        label: true,
      },
      orderBy: { posts: { _count: 'desc' } },
      take: 20,
    })
  }),
  popularByCategoryId: procedure
    .input(z.object({ categoryId: schemaPostCategoryId }))
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
  // ADD
  addToPost: protectedProcedure
    .input(
      z.object({
        postId: z.string().cuid(),
        tagId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId, tagId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postId,
      })

      await ctx.prisma.post.update({
        where: { id: postId },
        data: {
          tags: { connect: { tagId } },
        },
      })
    }),
  // REMOVE
  removeFromPost: protectedProcedure
    .input(
      z.object({
        postId: z.string().cuid(),
        tagId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId, tagId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postId,
      })

      await ctx.prisma.post.update({
        where: { id: postId },
        data: {
          tags: { disconnect: { tagId } },
        },
      })
    }),
  // SEARCH
  search: procedure.input(schemaTagSearch).query(async ({ input, ctx }) => {
    const { searchInput } = input

    return await ctx.prisma.postTag.findMany({
      where: {
        OR: [
          {
            label: { contains: searchInput, mode: 'insensitive' },
          },
          {
            description: { contains: searchInput, mode: 'insensitive' },
          },
        ],
      },
      orderBy: { posts: { _count: 'desc' } },
      take: 20,
    })
  }),
})
