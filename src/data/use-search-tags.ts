import { useQuery } from 'react-query'
import { RequestBodyTags, TagAPI } from '../pages/api/search-tags'

const urlSearchTags = '/api/search-tags'

async function fetchSearchTags(searchInput: string): Promise<TagAPI[]> {
  const body: RequestBodyTags = {
    searchInput,
  }
  const response = await fetch(urlSearchTags, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const tagsJSON: TagAPI[] = await response.json()

  return tagsJSON
}

export function useSearchTags(searchInput: string) {
  const { data, isLoading, isError, isFetching } = useQuery<TagAPI[]>(
    `search-tags-${searchInput}`,
    () => fetchSearchTags(searchInput),
    { enabled: !!searchInput && searchInput.length >= 2 }
  )

  return {
    tagsSearched: data || null,
    isLoading,
    isError,
    isFetching,
  }
}
