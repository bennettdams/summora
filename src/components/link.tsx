import NextLink from 'next/link'
import { ReactNode } from 'react'

export function Link({
  to,
  children,
  disablePrefetch = undefined,
  className,
}: {
  to: string
  children: ReactNode
  /**
   * By default, Next.js' links will be prefetched when they come into viewport or when they're hovered.
   */
  disablePrefetch?: true
  className?: string
}): JSX.Element {
  return (
    <NextLink
      href={to}
      scroll={true}
      className={`cursor-pointer ${className}`}
      prefetch={disablePrefetch ? false : undefined}
    >
      {children}
    </NextLink>
  )
}

export function LinkExternal({
  to,
  children,
  className,
}: {
  to: string
  children: ReactNode
  className?: string
}): JSX.Element {
  return (
    <a
      href={to}
      target="_blank"
      rel="noreferrer"
      className={`cursor-pointer ${className}`}
    >
      {children}
    </a>
  )
}
