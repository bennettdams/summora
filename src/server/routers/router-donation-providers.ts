import { Prisma } from '@prisma/client'
import { t } from '../trpc'

const defaultDonationProvidersSelect =
  Prisma.validator<Prisma.DonationProviderSelect>()({
    name: true,
    donationProviderId: true,
  })

export const donationProviderRouter = t.router({
  // READ ALL
  all: t.procedure.query(async ({ ctx }) => {
    const donationProviders = await ctx.prisma.donationProvider.findMany({
      select: defaultDonationProvidersSelect,
      orderBy: { name: 'asc' },
    })

    return donationProviders
  }),
})
