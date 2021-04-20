import { ReactNode } from 'react'
import NextLink from 'next/link'

export function Link({
  to,
  children,
}: {
  to: string
  children: ReactNode
}): JSX.Element {
  return (
    <NextLink href={to}>
      <div className="cursor-pointer">{children}</div>
    </NextLink>
  )
}
