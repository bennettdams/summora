export interface HttpResponse<T> extends Response {
  result?: T
}

/**
 * Prefix for all API requests.
 */
export const apiPrefix = '/api/'

/**
 * Base path for all requests.
 * Fetching on the server needs an absolute path.
 */
const base = apiPrefix

function createRequest(path: RequestInfo, args: RequestInit | undefined) {
  return new Request(base + path, args)
}

/**
 * Executes an HTTP request.
 */
async function http<T>(request: Request): Promise<HttpResponse<T>> {
  const response: HttpResponse<T> = await fetch(request, {
    headers: new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json', // used for proxy in dev: https://create-react-app.dev/docs/proxying-api-requests-in-development/
    }),
  })

  if (!response.ok) {
    const message = `Response not OK! Status code: ${response.status}, status text: ${response.statusText}`
    /*
     * For authenticated requests (like "refresh") we expect the request to fail (e.g. when a user is not signed in).
     * In that case, we can't throw an error as it would just block the app (instead of allowing the auth flow (like opening a modal)).
     */
    if (response.status === 401) {
      console.error(message)
    } else {
      throw new Error(message)
    }
  }

  if (response.body !== null && response.status !== 204) {
    response.result = await response.json()
  }

  return response
}

/**
 * HTTP GET request.
 *
 * @param path API endpoint identifier, e. g. "posts"
 */
export async function get<T>(
  path: string,
  args: RequestInit = { method: 'get' }
): Promise<HttpResponse<T>> {
  return await http<T>(createRequest(path, args))
}

/**
 * HTTP POST request.
 *
 * @param path API endpoint identifier, e. g. "posts"
 */
export async function post<T>(
  path: string,
  body: unknown,
  args: RequestInit = { method: 'post', body: JSON.stringify(body) }
): Promise<HttpResponse<T>> {
  return await http<T>(createRequest(path, args))
}

/**
 * HTTP PUT request.
 *
 * @param path API endpoint identifier, e. g. "posts"
 */
export async function put<T>(
  path: string,
  body: unknown,
  args: RequestInit = { method: 'put', body: JSON.stringify(body) }
): Promise<HttpResponse<T>> {
  return await http<T>(createRequest(path, args))
}

/**
 * HTTP PUT request.
 *
 * @param path API endpoint identifier, e. g. "posts"
 */
export async function deleteHTTP<T>(
  path: string,
  args: RequestInit = { method: 'delete' }
): Promise<HttpResponse<T>> {
  return await http<T>(createRequest(path, args))
}
