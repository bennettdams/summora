import type { NextRouter } from 'next/router'
import { useEffect } from 'react'

type URLSearchParamsNext = NextRouter['query']

const searchParams = {
  s: 'Search for posts',
} as const
type SearchParamKey = keyof typeof searchParams

/** Naive implementation that only allows one search param at a time. */
export function createRouteWithSearchParam({
  route,
  searchParamKey,
  value,
}: {
  route: string
  searchParamKey: SearchParamKey
  value: string
}) {
  return `${route}?${searchParamKey}=${encodeURIComponent(value)}`
}

export function getSearchParam(
  searchParamKey: SearchParamKey,
  routerQuery: URLSearchParamsNext
) {
  const searchParamRaw = routerQuery[searchParamKey]
  if (typeof searchParamRaw === 'string') {
    return searchParamRaw
  } else {
    return null
  }
}

function changeSearchParams({
  searchParamKey,
  value,
  pathname,
  push,
}: {
  searchParamKey: SearchParamKey
  value: string
  pathname: NextRouter['pathname']
  push: NextRouter['push']
}) {
  const params = new URLSearchParams(searchParams)

  params.set(searchParamKey, value)

  const paramsAsString = params.toString()

  push(pathname + '?' + paramsAsString, undefined, {
    shallow: true,
  })
}

export function useSyncSearchParamFromState({
  searchParamKey,
  value,
  isEnabled,
  pathname,
  push,
  query,
}: {
  searchParamKey: SearchParamKey
  value: string
  isEnabled: boolean
  pathname: NextRouter['pathname']
  push: NextRouter['push']
  query: NextRouter['query']
}) {
  useEffect(() => {
    if (isEnabled) {
      const current = getSearchParam(searchParamKey, query)
      if (current !== value) {
        changeSearchParams({
          searchParamKey,
          value,
          pathname,
          push,
        })
      }
    }
  }, [searchParamKey, value, isEnabled, pathname, push, query])
}
