import { z } from 'zod'

export const generalFormErrorKey = 'general-form-error-key'

export const addressSchema = z.string().min(1).max(128)
const donationProviderIdSchema = z.string().min(1, 'Please select a provider.')

export const schemaUpdateDonationLink = z.object({
  donationLinksToUpdate: z.array(
    z
      .object({
        donationLinkId: z.string().cuid(),
        donationProviderId: donationProviderIdSchema.optional(),
        address: addressSchema.optional(),
      })
      .refine((data) => !!data.address || !!data.donationProviderId, {
        message: 'Either address or donation provider should be changed.',
        path: [generalFormErrorKey],
      })
  ),
})
