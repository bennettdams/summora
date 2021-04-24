import { ReactNode } from 'react'

export function Box({
  children,
  noPadding = false,
}: {
  children: ReactNode
  noPadding?: boolean
}): JSX.Element {
  return (
    <div
      className={`box bg-white rounded-xl shadow-md hover:shadow-lg ${
        noPadding ? 'p-0' : 'p-10'
      }`}
    >
      {children}
    </div>
  )
}
