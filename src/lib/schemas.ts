import { DonationProviderId } from '@prisma/client'
import { z } from 'zod'
import { OmitStrict, Undefinable } from '../types/util-types'

/**
 * This is a hack for a schema that needs an `undefined` field on the input which is not allowed to be `undefined` for the output.
 * This situation e.g. exists on fields of an initial form to create something. e.g. we don't want to have a category selected when
 * a new post is created, so the field is `undefined`.
 */
export type FormDefaultValuesUndefinable<
  TSchema extends z.ZodTypeAny['_output'],
  TKeyToOverwrite extends keyof TSchema
> = OmitStrict<TSchema, TKeyToOverwrite> & {
  [K in keyof TSchema as TKeyToOverwrite]: Undefinable<TSchema[TKeyToOverwrite]>
}

export const generalFormErrorKey = 'general-form-error-key'

export const addressSchema = z.string().min(1).max(128)
const donationProviderIdSchema = z.nativeEnum(DonationProviderId, {
  required_error: 'Provider required',
})
const postCategorySchema = z
  .string({ required_error: 'Category required' })
  .min(1)
  .max(128)

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

export const schemaUpdatePostCategory = z.object({
  postId: z.string().cuid(),
  categoryId: postCategorySchema,
})

export const schemaCreatePost = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  categoryId: postCategorySchema,
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
    donationProviderId: donationProviderIdSchema,
  })
  .refine((data) => !!data.address && !!data.donationProviderId, {
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

export const schemaCreatePostComment = z.object({
  postId: z.string().cuid(),
  // null for root comments
  commentParentId: z.string().cuid().nullable(),
  text: z.string().min(1),
})
