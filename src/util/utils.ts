export function isServer(): boolean {
  return typeof document === 'undefined'
}

/** Type-guard useful for a result of `Promise.allSettled`. */
export function isPromiseFulfilled<T>(
  p: PromiseSettledResult<T>
): p is PromiseFulfilledResult<T> {
  return p.status === 'fulfilled'
}
