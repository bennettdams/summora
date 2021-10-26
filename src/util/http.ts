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
  const response: HttpResponse<T> = await fetch(request)

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
  // TODO Record<string, unknown>?
  body: unknown,
  args: RequestInit = { method: 'post', body: JSON.stringify(body) }
): Promise<HttpResponse<T>> {
  return await http<T>(createRequest(path, args))
}

/**
 * Key used for multipart/form-data requests created via {@link postFile}.
 */
export const FORM_DATA_FILE_KEY = 'fileToUpload'
/**
 * HTTP POST request for files.
 *
 * @param path API endpoint identifier, e. g. "posts"
 */
export async function postFile<T>(
  path: string,
  file: File,
  args: RequestInit = { method: 'post' }
): Promise<HttpResponse<T>> {
  const formData = new FormData()
  formData.append(FORM_DATA_FILE_KEY, file)

  args.body = formData
  return await http<T>(createRequest(path, args))
}

/**
 * HTTP PUT request.
 *
 * @param path API endpoint identifier, e. g. "posts"
 */
export async function put<T>(
  path: string,
  // TODO Record<string, unknown>?
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
