import { QueryKey, useQuery } from 'react-query'
import { ApiTagsSearch } from '../pages/api/tags/search'
import { apiCreateTagsSearch } from '../services/api-service'

const queryKeyPostBase = 'tags-search'
type QueryData = ApiTagsSearch | null

function createQueryKey(searchInput: string): QueryKey {
  return [queryKeyPostBase, searchInput]
}

export function useSearchTags(searchInput: string) {
  const { data, isLoading, isError, isFetching } = useQuery<QueryData>(
    createQueryKey(searchInput),
    async () => (await apiCreateTagsSearch({ searchInput })).result ?? null,
    {
      enabled: !!searchInput && searchInput.length >= 2,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

  return {
    tagsSearched: data || null,
    isLoading,
    isError,
    isFetching,
  }
}
