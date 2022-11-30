import { Prisma } from '@prisma/client'
import { procedure, router } from '../trpc'

const defaultDonationProvidersSelect =
  Prisma.validator<Prisma.DonationProviderSelect>()({
    name: true,
    donationProviderId: true,
  })

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
