import {
  dehydrate as dehydrateReactQuery,
  Hydrate,
  QueryClient,
} from 'react-query'
import type { DehydratedState as DehydratedStateReactQuery } from 'react-query'
import type { ReactNode } from 'react'

export type DehydratedState = DehydratedStateReactQuery
type QueryData = null | Record<string, unknown> | Record<string, unknown>[]
type TransformCallbackFn<T> = (data: T) => T
type SerializeFn<T> = (data: T) => T
type DehydrateFn = (client: QueryClient) => DehydratedState
type CreateClientFn = () => QueryClient

/**
 * Single entrypoint to create a hydration handler that can be used for a queries (e.g. "batches" or "batchId").
 *
 * It will create the tools needed to do de-/hydration, besides the prefetching.
 *
 * @param transformCb Callback function that does the transformation when deserializing.
 */
export function createHydrationHandler<TData extends QueryData>(
  transformCb: TransformCallbackFn<TData>
): {
  createClient: CreateClientFn
  dehydrate: DehydrateFn
  serialize: SerializeFn<TData>
  Hydrate: ({
    dehydratedState,
    children,
  }: {
    dehydratedState: DehydratedState
    children: ReactNode
  }) => ReturnType<typeof Hydrate>
} {
  return {
    createClient,
    dehydrate,
    serialize,
    Hydrate: (props) =>
      Hydrate({
        ...props,
        state: deserialize(props.dehydratedState, transformCb),
      }),
  }
}

function serialize<TDataSerialize>(data: TDataSerialize): TDataSerialize {
  return JSON.parse(JSON.stringify(data))
}

function createClient(): QueryClient {
  return new QueryClient()
}

function dehydrate(client: QueryClient): DehydratedState {
  return dehydrateReactQuery(client)
}

/**
 * Takes care of deserializing query state data from a dehydrated state.
 * Transforms the data with callback inside.
 *
 * Is used in the hydration process.
 */
function deserialize<TDataDeserialize extends QueryData>(
  dehydratedState: DehydratedState,
  transformCb: TransformCallbackFn<TDataDeserialize>
): DehydratedState {
  return {
    ...dehydratedState,
    queries: dehydratedState.queries.map((query) => {
      // FIXME not type-safe, as React Query does not allow providing a generic
      const queryStateData = query.state.data as TDataDeserialize
      if (queryStateData) {
        query.state.data = transformCb(queryStateData)
      }
      return query
    }),
  }
}
