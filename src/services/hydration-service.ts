import { ServerPageProps } from '../types/PageProps'
import { dehydrate as dehydrateReactQuery, QueryClient } from 'react-query'
import { serialize } from './serialize-service'

type DehydratedState = ServerPageProps['dehydratedState']
type QueryData = null | Record<string, unknown> | Record<string, unknown>[]
type TransformCallbackFn<T> = (data: T) => T
type SerializeFn<T> = (data: T) => T
type DeserializeFn = (dehydratedState: DehydratedState) => DehydratedState
type DehydrateFn = (client: QueryClient) => DehydratedState
type CreateClientFn = () => QueryClient

/**
 * Single entrypoint to create a hydration handler that can be used for a queries (e.g. "posts" or "postId").
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
  deserialize: DeserializeFn
} {
  return {
    createClient,
    dehydrate,
    serialize,
    deserialize: (dehydratedState) =>
      deserializeQueryData(dehydratedState, transformCb),
  }
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
function deserializeQueryData<TDataDeserialize extends QueryData>(
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
