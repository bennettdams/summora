import { ROUTES_API } from '../services/api-service'

/**
 * Logger for an API route.
 * Supposed to be used on the server.
 */
export function logAPI(
  route: keyof typeof ROUTES_API,
  method: string | undefined,
  additionalText?: string
): void {
  if (process.env.NODE_ENV === 'development') {
    let log = `[API] ${ROUTES_API[route]} | method: ${method}`
    if (additionalText) {
      log += ` | ${additionalText}`
    }

    console.info(log)
  }
}
