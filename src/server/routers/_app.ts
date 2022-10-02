/**
 * This file contains the root router of your tRPC-backend
 */
import { t } from '../trpc'
import { donationLinkRouter } from './router-donation-link'
import { donationProviderRouter } from './router-donation-providers'
import { userRouter } from './router-user'
import { userPostsRouter } from './router-user-posts'

/**
 * Application's root router.
 * @link https://trpc.io/docs/router
 */
export const appRouter = t.router({
  user: userRouter,
  userPosts: userPostsRouter,
  donationLink: donationLinkRouter,
  donationProvider: donationProviderRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
