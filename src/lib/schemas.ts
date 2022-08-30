import { z } from 'zod'

export const addressSchema = z.string().min(1).max(128)

export const schemaUpdateDonationLink = z.object({
  donationLinksToUpdate: z.array(
    z
      .object({
        donationLinkId: z.string().cuid(),
        donationProviderId: z.string().min(1).optional(),
        address: addressSchema.optional(),
      })
      .refine(
        (data) => !!data.address || !!data.donationProviderId,
        'Either address or donation provider ID should be filled in.'
      )
  ),
})
