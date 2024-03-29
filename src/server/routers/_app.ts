/**
 * This file contains the root router of your tRPC-backend
 */
import { router } from '../trpc'
import { donationLinkRouter } from './router-donation-link'
import { donationProviderRouter } from './router-donation-providers'
import { imageUploadRouter } from './router-image-upload'
import { postCategoriesRouter } from './router-post-categories'
import { postCommentsRouter } from './router-post-comment'
import { postLikesRouter } from './router-post-likes'
import { postSegmentItemsRouter } from './router-post-segment-items'
import { postSegmentsRouter } from './router-post-segments'
import { postTagsRouter } from './router-post-tags'
import { postsRouter } from './router-posts'
import { userRouter } from './router-user'

/**
 * Application's root router.
 * @link https://trpc.io/docs/router
 */
export const appRouter = router({
  posts: postsRouter,
  postLikes: postLikesRouter,
  postSegments: postSegmentsRouter,
  postSegmentItems: postSegmentItemsRouter,
  postTags: postTagsRouter,
  postCategories: postCategoriesRouter,
  user: userRouter,
  donationLink: donationLinkRouter,
  donationProvider: donationProviderRouter,
  postComments: postCommentsRouter,
  imageUpload: imageUploadRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
