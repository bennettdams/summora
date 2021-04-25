import { ReactNode } from 'react'

export function Button({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button onClick={onClick} className="bg-green-200 p-4 rounded-md shadow-sm">
      {children}
    </button>
  )
}
