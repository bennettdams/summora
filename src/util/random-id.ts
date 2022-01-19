/**
 * Very naive implementation, don't use for important stuff.
 */
export function createRandomId(prefix?: string): string {
  return `${prefix ?? ''}${Math.random().toString(36).substring(2, 9)}`
}
