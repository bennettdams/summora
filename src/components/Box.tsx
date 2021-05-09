import { ReactNode, RefObject } from 'react'

export function Box({
  children,
  noPadding = false,
  smallPadding = false,
  onClick,
  refExternal,
}: {
  children: ReactNode
  onClick?: () => void
  refExternal?: RefObject<HTMLDivElement>
} & (
  | { smallPadding?: boolean; noPadding?: never }
  | { smallPadding?: never; noPadding?: boolean }
)): JSX.Element {
  return (
    <div
      onClick={() => onClick && onClick()}
      ref={refExternal}
      className={`box bg-white rounded-xl shadow-md hover:shadow-lg ${
        noPadding ? 'p-0' : smallPadding ? 'p-4' : 'p-10'
      } ${onClick && 'cursor-pointer'}`}
    >
      {children}
    </div>
  )
}
