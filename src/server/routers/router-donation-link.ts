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

export const donationLinkRouter = createRouter()
  // CREATE
  .mutation('createByUserId', {
    input: z.object({
      newDonationLink: schemaCreateDonationLink,
    }),
    async resolve({ input, ctx }) {
      const { newDonationLink } = input

      const userIdAuth = await checkAuthTRPC(ctx)

      return await ctx.prisma.donationLink.create({
        data: {
          address: newDonationLink.address,
          donationProvider: {
            connect: { donationProviderId: newDonationLink.donationProviderId },
          },
          User: { connect: { userId: userIdAuth } },
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
  //  UPDATE MANY
  .mutation('editMany', {
    input: schemaUpdateDonationLink,
    async resolve({ input, ctx }) {
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
