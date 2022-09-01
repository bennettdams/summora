import { Prisma } from '@prisma/client'
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

      return donationProviders
    },
  })
