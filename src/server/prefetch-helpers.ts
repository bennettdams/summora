import { createProxySSGHelpers as createProxySSGHelpersTRPC } from '@trpc/react/ssg'
import superjson from 'superjson'
import { createContextTRPC } from './context-trpc'
import { appRouter } from './routers/_app'

export async function createPrefetchHelpers() {
  return createProxySSGHelpersTRPC({
    router: appRouter,
    ctx: await createContextTRPC(),
    transformer: superjson,
  })
}
