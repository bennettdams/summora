/**
 * This file contains the root router of your tRPC-backend
 */
import superjson from 'superjson'
import { createRouter } from '../context'
import { donationLinkRouter } from './router-donation-link'
import { donationProviderRouter } from './router-donation-providers'

/**
 * Create your application's root router.
 * If you want to use SSG, you need export this.
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = createRouter()
  /**
   * Add data transformers.
   * @link https://trpc.io/docs/data-transformers
   */
  .transformer(superjson)
  /**
   * Optionally do custom error (type safe!) formatting.
   * @link https://trpc.io/docs/error-formatting
   */
  // .formatError(({ shape, error }) => { })
  .merge('donationLink.', donationLinkRouter)
  .merge('donationProvider.', donationProviderRouter)

export type AppRouter = typeof appRouter
