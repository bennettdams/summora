import { ReactNode } from 'react'

export function Button({ children }: { children: ReactNode }): JSX.Element {
  return (
    <button className="bg-green-200 p-4 rounded-md shadow-sm">
      {children}
    </button>
  )
}
