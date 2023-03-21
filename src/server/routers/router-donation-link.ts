/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import type { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  schemaCreateDonationLink,
  schemaUpdateDonationLink,
} from '../../lib/schemas'
import { ensureAuthorTRPC } from '../api-security'
import { ContextTRPC } from '../context-trpc'
import { procedure, protectedProcedure, router } from '../trpc'

/**
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultDonationLinkSelect = {
  donationLinkId: true,
  address: true,
  donationProvider: {
    select: { name: true, donationProviderId: true },
  },
} satisfies Prisma.DonationLinkSelect

async function ensureAuthor({
  userIdAuth,
  prisma,
  donationLinkId,
}: {
  userIdAuth: string
  prisma: ContextTRPC['prisma']
  donationLinkId: string
}) {
  await ensureAuthorTRPC({
    topic: 'donation link',
    userIdAuth,
    cbQueryEntity: async () => {
      const result = await prisma.donationLink.findUnique({
        where: { donationLinkId },
        select: {
          userId: true,
        },
      })
      if (!result?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The donation link you tried to update does not exis',
        })
      } else {
        return { authorId: result.userId, entity: null }
      }
    },
  })
}

export const donationLinkRouter = router({
  // CREATE
  createByUserId: protectedProcedure
    .input(
      z.object({
        newDonationLink: schemaCreateDonationLink,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { newDonationLink } = input

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
          user: { connect: { id: ctx.userIdAuth } },
        },
        select: defaultDonationLinkSelect,
      })
    }),
  // READ MANY
  byUserId: procedure
    .input(
      z.object({
        userId: z.string().cuid(),
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
  editMany: protectedProcedure
    .input(schemaUpdateDonationLink)
    .mutation(async ({ input, ctx }) => {
      const { donationLinksToUpdate } = input

      await Promise.all(
        donationLinksToUpdate.map(async (donationLinkToUpdate) => {
          const { donationLinkId, address, donationProviderId } =
            donationLinkToUpdate

          await ensureAuthor({
            userIdAuth: ctx.userIdAuth,
            prisma: ctx.prisma,
            donationLinkId,
          })

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
  delete: protectedProcedure
    .input(
      z.object({
        donationLinkId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { donationLinkId } = input

      await ensureAuthor({
        userIdAuth: ctx.userIdAuth,
        prisma: ctx.prisma,
        donationLinkId,
      })

      await ctx.prisma.donationLink.delete({ where: { donationLinkId } })
    }),
})
