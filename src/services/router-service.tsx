import type { NextRouter } from 'next/router'

type URLSearchParamsNext = NextRouter['query']

const searchParams = {
  s: 'Search for posts',
} as const
type SearchParamKey = keyof typeof searchParams

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
