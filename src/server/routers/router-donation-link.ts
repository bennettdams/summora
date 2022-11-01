/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { checkAuthTRPC, ensureAuthorTRPC } from '../../lib/api-security'
import {
  schemaCreateDonationLink,
  schemaUpdateDonationLink,
} from '../../lib/schemas'
import { ContextTRPC } from '../context-trpc'
import { t } from '../trpc'

/**
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultDonationLinkSelect = Prisma.validator<Prisma.DonationLinkSelect>()(
  {
    donationLinkId: true,
    address: true,
    donationProvider: {
      select: { name: true, donationProviderId: true },
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

export const donationLinkRouter = t.router({
  // CREATE
  createByUserId: t.procedure
    .input(
      z.object({
        newDonationLink: schemaCreateDonationLink,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { newDonationLink } = input

      const userIdAuth = await checkAuthTRPC(ctx)

      if (!newDonationLink.donationProviderId)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Donation provider is not given.',
        })

      return await ctx.prisma.donationLink.create({
        data: {
          address: newDonationLink.address,
          donationProvider: {
            connect: {
              donationProviderId: newDonationLink.donationProviderId,
            },
          },
          User: { connect: { userId: userIdAuth } },
        },
        select: defaultDonationLinkSelect,
      })
    }),
  // READ MANY
  byUserId: t.procedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input

      const donationLinks = await ctx.prisma.donationLink.findMany({
        where: { userId },
        select: defaultDonationLinkSelect,
        orderBy: { createdAt: 'asc' },
      })

      return donationLinks
    }),
  //  UPDATE MANY
  editMany: t.procedure
    .input(schemaUpdateDonationLink)
    .mutation(async ({ input, ctx }) => {
      const { donationLinksToUpdate } = input

      await Promise.all(
        donationLinksToUpdate.map(async (donationLinkToUpdate) => {
          const { donationLinkId, address, donationProviderId } =
            donationLinkToUpdate

          await ensureAuthor(ctx, donationLinkId)

          return ctx.prisma.donationLink.update({
            where: { donationLinkId },
            data: {
              address: address,
              donationProvider: !donationProviderId
                ? undefined
                : {
                    connect: { donationProviderId },
                  },
            },
            select: defaultDonationLinkSelect,
          })
        })
      )
    }),
  // DELETE
  delete: t.procedure
    .input(
      z.object({
        donationLinkId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { donationLinkId } = input

      await ensureAuthor(ctx, donationLinkId)

      await ctx.prisma.donationLink.delete({ where: { donationLinkId } })
    }),
})
