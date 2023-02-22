export function isServer(): boolean {
  return typeof document === 'undefined'
}

export function serverOnly() {
  if (!isServer()) throw new Error('Only allowed on on the server.')
}

/** Type-guard useful for a result of `Promise.allSettled`. */
export function isPromiseFulfilled<T>(
  p: PromiseSettledResult<T>
): p is PromiseFulfilledResult<T> {
  return p.status === 'fulfilled'
}
