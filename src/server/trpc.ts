import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { ContextTRPC } from './context-trpc'

export const t = initTRPC.context<ContextTRPC>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})
