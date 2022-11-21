import NextLink from 'next/link'
import { ReactNode } from 'react'

export function Link({
  to,
  children,
  disablePrefetch = undefined,
}: {
  to: string
  children: ReactNode
  /**
   * By default, Next.js' links will be prefetched when they come into viewport or when they're hovered.
   */
  disablePrefetch?: true
}): JSX.Element {
  return (
    <NextLink href={to} prefetch={disablePrefetch ? false : undefined}>
      <div className="cursor-pointer">{children}</div>
    </NextLink>
  )
}

export function LinkExternal({
  to,
  children,
}: {
  to: string
  children: ReactNode
}): JSX.Element {
  return (
    <a href={to} target="_blank" rel="noreferrer">
      <div className="cursor-pointer">{children}</div>
    </a>
  )
}
