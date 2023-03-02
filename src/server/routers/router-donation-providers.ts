import type { Prisma } from '@prisma/client'
import { procedure, router } from '../trpc'

const defaultDonationProvidersSelect = {
  name: true,
  donationProviderId: true,
} satisfies Prisma.DonationProviderSelect

export const donationProviderRouter = router({
  // READ ALL
  all: procedure.query(async ({ ctx }) => {
    const donationProviders = await ctx.prisma.donationProvider.findMany({
      select: defaultDonationProvidersSelect,
      orderBy: { name: 'asc' },
    })

    return donationProviders
  }),
})
