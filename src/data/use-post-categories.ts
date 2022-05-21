import { QueryClient, useQuery } from 'react-query'
import { ApiPostCategories } from '../pages/api/post-categories'
import { apiFetchPostCategories } from '../services/api-service'
import { createHydrationHandler } from '../services/hydration-service'

const queryKey = 'post-categories'
type QueryData = ApiPostCategories

export const hydrationHandler = createHydrationHandler<QueryData>((data) =>
  !data ? [] : data
)

export function prefillServer(
  queryClient: QueryClient,
  postCategories: QueryData
): void {
  queryClient.setQueryData(queryKey, postCategories)
}

/**
 * Provides data of user posts from the API.
 */
export function usePostCategories() {
  const { isLoading, data } = useQuery<QueryData>(
    queryKey,
    async () => (await apiFetchPostCategories()).result ?? [],
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 60 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    }
  )

  return {
    isLoading,
    postCategories: data ?? [],
  }
}
