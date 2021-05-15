import { ReactNode } from 'react'

export function Page({ children }: { children: ReactNode }): JSX.Element {
  return (
    <main className="page container flex-1 w-full flex flex-col mt-20 pb-32">
      {children}
    </main>
  )
}

export function PageSection({
  children,
  hideTopMargin = false,
}: {
  children: ReactNode
  hideTopMargin?: boolean
}): JSX.Element {
  return (
    <section
      className={`page-section w-full ${hideTopMargin ? 'mt-0' : 'mt-10'}`}
    >
      {children}
    </section>
  )
}
