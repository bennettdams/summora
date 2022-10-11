import { ReactNode } from 'react'

export function NoContent({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-center italic">{children}</p>
}
