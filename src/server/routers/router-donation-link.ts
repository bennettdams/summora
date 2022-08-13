/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { checkAuthTRPC, ensureAuthorTRPC } from '../../lib/api-security'
import { ContextTRPC, createRouter } from '../context'

/**
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultDonationLinkSelect = Prisma.validator<Prisma.DonationLinkSelect>()(
  {
    donationLinkId: true,
    address: true,
    donationProvider: {
      select: { name: true, donationProviderId: true, logoId: true },
    },
  }
)

async function ensureAuthor(ctx: ContextTRPC, donationLinkId: string) {
  await ensureAuthorTRPC({
    topic: 'donation link',
    ctx,
    cbQueryEntity: async () => {
      const res = await ctx.prisma.donationLink.findUnique({
        where: { donationLinkId },
        select: {
          userId: true,
        },
      })
      if (!res?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The donation link you tried to update does not exist.',
        })
      } else {
        return { authorId: res.userId, entity: null }
      }
    },
  })
}

const addressSchema = z.string().min(1).max(128)

export const donationLinkRouter = createRouter()
  // CREATE
  .mutation('addByUserId', {
    input: z.object({
      userId: z.string().uuid(),
      data: z.object({
        donationProviderId: z.string().min(1),
        address: addressSchema,
      }),
    }),
    async resolve({ input, ctx }) {
      const { userId, data } = input

      await checkAuthTRPC(ctx)

      await ctx.prisma.donationLink.create({
        data: {
          address: data.address,
          donationProvider: {
            connect: { donationProviderId: data.donationProviderId },
          },
          User: { connect: { userId } },
        },
        select: defaultDonationLinkSelect,
      })
    },
  })
  // READ
  .query('byUserId', {
    input: z.object({
      userId: z.string().uuid(),
    }),
    async resolve({ input, ctx }) {
      const { userId } = input

      const donationLinks = await ctx.prisma.donationLink.findMany({
        where: { userId },
        select: defaultDonationLinkSelect,
        orderBy: { createdAt: 'asc' },
      })

      if (!donationLinks) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No donation links for user id '${userId}'`,
        })
      } else {
        return donationLinks
      }
    },
  })
  // UPDATE
  .mutation('edit', {
    input: z.object({
      donationLinkId: z.string().cuid(),
      data: z.object({
        donationProviderId: z.string().min(1),
        address: addressSchema,
      }),
    }),
    async resolve({ input, ctx }) {
      const { data, donationLinkId } = input
      const { donationProviderId, address } = data

      await ensureAuthor(ctx, donationLinkId)

      return ctx.prisma.donationLink.update({
        where: { donationLinkId },
        data: {
          address,
          donationProvider: { connect: { donationProviderId } },
        },
        select: defaultDonationLinkSelect,
      })
    },
  })
  // DELETE
  .mutation('delete', {
    input: z.object({
      donationLinkId: z.string().cuid(),
    }),
    async resolve({ input, ctx }) {
      const { donationLinkId } = input

      await ensureAuthor(ctx, donationLinkId)

      await ctx.prisma.donationLink.delete({ where: { donationLinkId } })

      return {
        donationLinkId,
      }
    },
  })
// .mutation('editMany', {
//   input: z.object({
//     data: z.array(
//       z.object({
//         donationLinkId: z.string().cuid(),
//         donationProviderId: z.string(),
//         address: z.string(),
//       })
//     ),
//   }),
//   async resolve({ input, ctx }) {
//     const { data } = input

//     const donationLinksUpdated = await ctx.prisma.$transaction(
//       data.map((donationLink) => {
//         const { donationLinkId, donationProviderId, address } = donationLink

//         return ctx.prisma.donationLink.update({
//           where: { donationLinkId },
//           data: {
//             address,
//             donationProvider: { connect: { donationProviderId } },
//           },
//           select: defaultDonationLinkSelect,
//         })
//       })
//     )

//     return donationLinksUpdated
//   },
// })
