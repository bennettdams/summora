import { createReactQueryHooks } from '@trpc/react'
import type { inferProcedureInput } from '@trpc/server'
import { AppRouter } from '../server/routers/_app'

export const trpc = createReactQueryHooks<AppRouter>()

export type InferMutationInput<
  TRouteKey extends keyof AppRouter['_def']['mutations']
> = inferProcedureInput<AppRouter['_def']['mutations'][TRouteKey]>
