import { ReactNode } from 'react'

export function Box({
  children,
  noPadding = false,
  smallPadding = false,
}: {
  children: ReactNode
} & (
  | { smallPadding?: boolean; noPadding?: never }
  | { smallPadding?: never; noPadding?: boolean }
)): JSX.Element {
  return (
    <div
      className={`box bg-white rounded-xl shadow-md hover:shadow-lg ${
        noPadding ? 'p-0' : smallPadding ? 'p-4' : 'p-10'
      }`}
    >
      {children}
    </div>
  )
}
