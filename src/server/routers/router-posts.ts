import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  schemaCreatePost,
  schemaPostSearch,
  schemaPostsExplore,
  schemaUpdatePost,
  schemaUpdatePostCategory,
  schemaUpdatePostSourceURL,
} from '../../lib/schemas'
import { createDateFromThePast } from '../../util/date-helpers'
import { ensureAuthorTRPC } from '../api-security'
import { deletePostInStorage } from '../cloud-storage'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

const defaultPostSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  title: true,
  subtitle: true,
  authorId: true,
  postCategoryId: true,
  noOfViews: true,
  sourceURL: true,
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
      imageFileExtension: true,
    },
  },
} satisfies Prisma.PostSelect

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
  // SOME BY USER ID
  someByUserId: procedure
    .input(z.object({ userId: z.string().cuid() }))
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

      const caller = postsRouter.createCaller({ prisma: ctx.prisma })
      // we deliberately don't `await` to not block this request
      caller.incrementViews({ postId })

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
  // EDIT SOURCE URL
  editSourceURL: protectedProcedure
    .input(schemaUpdatePostSourceURL)
    .mutation(async ({ input, ctx }) => {
      const { postId, sourceURL } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postId,
      })

      await ctx.prisma.post.update({
        where: { id: postId },
        data: { sourceURL },
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
  // TOP BY VIEWS
  topByViews: procedure
    .input(schemaPostsExplore)
    .query(async ({ ctx, input }) => {
      const { dateFromPast, tagIdsToFilter, categoryIdsToFilter } = input

      // keep in sync with other "top" query
      return await ctx.prisma.post.findMany({
        select: defaultPostSelect,
        take: 10,
        where: {
          updatedAt: { gte: createDateFromThePast(dateFromPast) },
          postCategoryId:
            categoryIdsToFilter.length === 0
              ? undefined
              : { in: categoryIdsToFilter },
          tags:
            tagIdsToFilter.length === 0
              ? undefined
              : {
                  some: {
                    tagId: { in: tagIdsToFilter },
                  },
                },
        },
        orderBy: [
          { noOfViews: 'desc' },
          { likedBy: { _count: 'desc' } },
          { title: 'asc' },
        ],
      })
    }),
  // TOP BY LIKES
  topByLikes: procedure
    .input(schemaPostsExplore)
    .query(async ({ ctx, input }) => {
      const { dateFromPast, tagIdsToFilter, categoryIdsToFilter } = input

      // keep in sync with other "top" query
      return await ctx.prisma.post.findMany({
        select: defaultPostSelect,
        take: 10,
        where: {
          updatedAt: { gte: createDateFromThePast(dateFromPast) },
          postCategoryId:
            categoryIdsToFilter.length === 0
              ? undefined
              : { in: categoryIdsToFilter },
          tags:
            tagIdsToFilter.length === 0
              ? undefined
              : {
                  some: {
                    tagId: { in: tagIdsToFilter },
                  },
                },
        },
        orderBy: [
          { likedBy: { _count: 'desc' } },
          { noOfViews: 'desc' },
          { title: 'asc' },
        ],
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
          author: { connect: { id: ctx.userIdAuth } },
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
  // INCREMENT VIEWS
  incrementViews: procedure
    .input(z.object({ postId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const { postId } = input

      await ctx.prisma.post.update({
        where: { id: postId },
        data: { noOfViews: { increment: 1 } },
        select: null,
      })

      // placeholder return as queries need one
      return null
    }),
  // SEARCH
  search: procedure.input(schemaPostSearch).query(async ({ input, ctx }) => {
    const {
      searchInput,
      tagIdsToFilter,
      includeTitle,
      includeSubtitle,
      includeSegmentsTitle,
      includeSegmentsSubtitle,
      categoryIdsToFilter,
    } = input

    return await ctx.prisma.post.findMany({
      select: defaultPostSelect,
      where: {
        OR: [
          {
            title: !includeTitle
              ? undefined
              : { contains: searchInput, mode: 'insensitive' },
          },
          {
            subtitle: !includeSubtitle
              ? undefined
              : { contains: searchInput, mode: 'insensitive' },
          },
          {
            segments: {
              some: {
                OR: [
                  {
                    title: !includeSegmentsTitle
                      ? undefined
                      : { contains: searchInput, mode: 'insensitive' },
                  },
                  {
                    subtitle: !includeSegmentsSubtitle
                      ? undefined
                      : { contains: searchInput, mode: 'insensitive' },
                  },
                ],
              },
            },
          },
        ],
        postCategoryId:
          categoryIdsToFilter.length === 0
            ? undefined
            : { in: categoryIdsToFilter },
        tags:
          tagIdsToFilter.length === 0
            ? undefined
            : {
                some: {
                  tagId: { in: tagIdsToFilter },
                },
              },
      },
      orderBy: [
        { likedBy: { _count: 'desc' } },
        { noOfViews: 'desc' },
        { title: 'asc' },
      ],
      take: 10,
    })
  }),
  // DELETE
  delete: protectedProcedure
    .input(
      z.object({
        postId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        postId,
      })

      /*
       * TODO
       * This execution setup means that if deleting the images fails for whatever reason,
       * the post will still be deleted. It is more important for the user to delete the
       * post, so we need to take care of removing "dead" images separately.
       */
      await deletePostInStorage(postId)

      await ctx.prisma.post.delete({ where: { id: postId } })
    }),
})
