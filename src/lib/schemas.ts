import { DonationProviderId } from '@prisma/client'
import { z } from 'zod'

export const generalFormErrorKey = 'general-form-error-key'

export const addressSchema = z.string().min(1).max(128)
const donationProviderIdSchema = z.nativeEnum(DonationProviderId)

export const schemaUpdatePost = z
  .object({
    postId: z.string().cuid(),
    title: z.string().min(1).optional(),
    subtitle: z.string().optional(),
  })
  .refine((data) => !!data.title || !!data.subtitle, {
    message: 'Either title or subtitle should be changed.',
    path: [generalFormErrorKey],
  })

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

export const schemaCreateDonationLink = z
  .object({
    address: addressSchema,
    /**
     * FIXME this is only nullable for the initial form. We don't want to have a default provider selected when
     * a new donation link is created. This is only implicitly type-safe via the `refine` below.
     */
    donationProviderId: donationProviderIdSchema.nullable(),
  })
  .refine((data) => !!data && !!data.address && !!data.donationProviderId, {
    message: 'Both address and donation provider should be filled in.',
    path: [generalFormErrorKey],
  })

export const schemaUpdatePostSegment = z
  .object({
    postSegmentId: z.string().cuid(),
    title: z.string().min(1).optional(),
    subtitle: z.string().optional(),
  })
  .refine((data) => !!data.title || !!data.subtitle, {
    message: 'Either title or subtitle should be changed.',
    path: [generalFormErrorKey],
  })

export const schemaUpdatePostSegmentItem = z.object({
  segmentItemId: z.string().cuid(),
  content: z.string().min(1),
})

export const schemaCreatePostSegmentItem = z.object({
  segmentId: z.string().cuid(),
  content: z.string().min(1),
})
