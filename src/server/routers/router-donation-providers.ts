import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { createRouter } from '../context'

const defaultDonationProvidersSelect =
  Prisma.validator<Prisma.DonationProviderSelect>()({
    name: true,
    donationProviderId: true,
    logoId: true,
  })

export const donationProviderRouter = createRouter()
  // READ ALL
  .query('all', {
    async resolve({ ctx }) {
      const donationProviders = await ctx.prisma.donationProvider.findMany({
        select: defaultDonationProvidersSelect,
        orderBy: { name: 'asc' },
      })

      if (donationProviders.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No donation providers available.',
        })
      } else {
        return donationProviders
      }
    },
  })
