import { ROUTES_API } from '../services/api'

/**
 * Logger for an API route.
 * Supposed to be used on the server.
 */
export function logAPI(
  route: keyof typeof ROUTES_API,
  method: string | undefined,
  additionalText?: string
): void {
  let log = `[API] ${ROUTES_API[route]} | method: ${method}`
  if (additionalText) {
    log += ` | ${additionalText}`
  }
  console.log(log)
}
