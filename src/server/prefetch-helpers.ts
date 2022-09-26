import { createProxySSGHelpers as createProxySSGHelpersTRPC } from '@trpc/react/ssg'
import superjson from 'superjson'
import { createContextTRPC } from './context-trpc'
import { appRouter } from './routers/_app'

// FIXME not working since 10.0.0-proxy-beta.7, let's the page hang indefinitely
export async function createPrefetchHelpers() {
  return createProxySSGHelpersTRPC({
    router: appRouter,
    ctx: await createContextTRPC(),
    transformer: superjson,
  })
}

export async function createPrefetchHelpersArgs() {
  return {
    router: appRouter,
    ctx: await createContextTRPC(),
    transformer: superjson,
  }
}
