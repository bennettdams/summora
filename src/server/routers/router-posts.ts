import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  schemaCreatePost,
  schemaUpdatePost,
  schemaUpdatePostCategory,
} from '../../lib/schemas'
import { ensureAuthorTRPC } from '../api-security'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  createdAt: true,
  updatedAt: true,
  title: true,
  subtitle: true,
  authorId: true,
  postCategoryId: true,
  noOfViews: true,
  _count: {
    select: {
      comments: true,
      likedBy: true,
    },
  },
  category: true,
  author: {
    select: {
      username: true,
      imageId: true,
      imageBlurDataURL: true,
    },
  },
})

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
    topic: 'post',
    userIdAuth,
    cbQueryEntity: async () => {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          authorId: true,
        },
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

export const postsRouter = router({
  // SOME
  some: procedure.query(async ({ ctx }) => {
    return await ctx.prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: defaultPostSelect,
    })
  }),
  // SOME BY USER ID
  someByUserId: procedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input

      return await ctx.prisma.post.findMany({
        where: { authorId: userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: defaultPostSelect,
      })
    }),
  // READ BY POST ID
  byPostId: procedure
    .input(z.object({ postId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const { postId } = input

      return await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: defaultPostSelect,
      })
    }),
  // EDIT
  edit: protectedProcedure
    .input(schemaUpdatePost)
    .mutation(async ({ input, ctx }) => {
      const { postId, title, subtitle } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postId,
      })

      await ctx.prisma.post.update({
        where: { id: postId },
        data: { title, subtitle },
      })
    }),
  // EDIT CATEGORY
  editCategory: protectedProcedure
    .input(schemaUpdatePostCategory)
    .mutation(async ({ input, ctx }) => {
      const { postId, categoryId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postId,
      })

      await ctx.prisma.post.update({
        where: { id: postId },
        data: { category: { connect: { id: categoryId } } },
      })
    }),
  // CREATE
  create: protectedProcedure
    .input(schemaCreatePost)
    .mutation(async ({ input, ctx }) => {
      const { title, subtitle, categoryId } = input

      return await ctx.prisma.post.create({
        data: {
          title,
          subtitle,
          author: { connect: { userId: ctx.userIdAuth } },
          category: { connect: { id: categoryId } },
        },
        select: { id: true },
      })
    }),
  // CREATE SEGMENT
  createSegment: protectedProcedure
    .input(z.object({ postId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postId,
      })

      await ctx.prisma.post.update({
        where: { id: postId },
        data: {
          segments: {
            create: {
              title: '',
              subtitle: '',
            },
          },
        },
      })
    }),
})
