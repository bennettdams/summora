import { DonationProviderId, PostCategoryId } from '@prisma/client'
import { z } from 'zod'
import { OmitStrict, Undefinable } from '../types/util-types'

/**
 * This is a hack for a schema that needs an `undefined` field on the input which is not allowed to be `undefined` for the output.
 * This situation e.g. exists on fields of an initial form to create something. e.g. we don't want to have a category selected when
 * a new post is created, so the field is `undefined`.
 * See: https://github.com/react-hook-form/react-hook-form/discussions/8496#discussioncomment-4042383
 */
export type FormDefaultValuesUndefinable<
  TSchema extends z.ZodTypeAny['_output'],
  TKeyToOverwrite extends keyof TSchema
> = OmitStrict<TSchema, TKeyToOverwrite> & {
  [K in keyof TSchema as TKeyToOverwrite]: Undefinable<TSchema[TKeyToOverwrite]>
}

/**
 * This is a hack to convert Prisma string literals to an enum-like.
 * We do this to prevent `@prisma/client` being part of the client bundle.
 * See: https://github.com/prisma/prisma/issues/13567#issuecomment-1332030096
 */
const donationProviderIdsMap: { [K in DonationProviderId]: K } = {
  BITCOIN: 'BITCOIN',
  PAYPAL: 'PAYPAL',
}
const donationProviderIdSchema = z.nativeEnum(donationProviderIdsMap, {
  required_error: 'Provider required',
})

export const generalFormErrorKey = 'general-form-error-key'

export const addressSchema = z.string().min(1).max(128)

const postCategoryIdsMap: { [K in PostCategoryId]: K } = {
  animals: 'animals',
  babys: 'babys',
  beauty: 'beauty',
  books: 'books',
  education: 'education',
  fashion: 'fashion',
  fooddrinks: 'fooddrinks',
  gaming: 'gaming',
  household: 'household',
  movies: 'movies',
  music: 'music',
  nature: 'nature',
  pcelectronics: 'pcelectronics',
  programming: 'programming',
  series: 'series',
  sports: 'sports',
  travel: 'travel',
  vehicles: 'vehicles',
}
export const schemaPostCategoryId = z.nativeEnum(postCategoryIdsMap, {
  required_error: 'Category ID required',
})

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
  categoryId: schemaPostCategoryId,
})

export const schemaCreatePost = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  categoryId: schemaPostCategoryId,
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

export const schemaTagSearch = z.object({
  searchInput: z.string().min(2).max(128),
})

export const schemaPostSearch = z.object({
  searchInput: z.string().min(2).max(128),
  includeTitle: z.boolean(),
  includeSubtitle: z.boolean(),
  includeSegmentsTitle: z.boolean(),
  includeSegmentsSubtitle: z.boolean(),
  tagIdsToFilter: z.array(z.string().cuid()),
  categoryIdsToFilter: z.array(schemaPostCategoryId),
})

export const schemaEditUsername = z.object({
  userId: z.string().cuid(),
  username: z.string().min(2).max(40),
})

export const schemaImageFileType = z.string().startsWith('image/')
