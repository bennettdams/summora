// import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ensureAuthorTRPC } from '../../lib/api-security'
import { ContextTRPC } from '../context-trpc'
import { t } from '../trpc'

// const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
//   id: true,
//   createdAt: true,
// })

async function ensureAuthor(ctx: ContextTRPC, postId: string) {
  await ensureAuthorTRPC({
    topic: 'post',
    ctx,
    cbQueryEntity: async () => {
      const post = await ctx.prisma.post.findUnique({
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

export const postsRouter = t.router({
  // CREATE SEGMENT
  createSegment: t.procedure
    .input(z.object({ postId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      await ensureAuthor(ctx, postId)

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
