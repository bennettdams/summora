/**
 * Logger for an API route.
 * Supposed to be used on the server.
 */
export function logAPI(
  method: string | undefined,
  additionalText?: string
): void {
  if (process.env.NODE_ENV === 'development') {
    let log = `[API] | method: ${method}`
    if (additionalText) {
      log += ` | ${additionalText}`
    }

    console.info(log)
  }
}
