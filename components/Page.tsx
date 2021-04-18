import { ReactNode } from 'react'

export function Page({ children }: { children: ReactNode }): JSX.Element {
  return (
    <main className="container flex-1 w-full flex flex-col mt-20">
      {children}
    </main>
  )
}
