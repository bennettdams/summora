import { createSSGHelpers as createSSGHelpersTRPC } from '@trpc/react/ssg'
import superjson from 'superjson'
import { createContext } from './context'
import { appRouter } from './routers/_app'

export async function createPrefetchHelpers() {
  return createSSGHelpersTRPC({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })
}
