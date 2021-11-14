import { ReactNode } from 'react'

export function Page({
  children,
  pageHeader,
}: {
  children: ReactNode
  pageHeader?: ReactNode
}): JSX.Element {
  return (
    <div className="page w-full mt-16 pb-32">
      {pageHeader && pageHeader}
      <main className="container w-full mx-auto mt-20 pb-32">{children}</main>
    </div>
  )
}

export function PageSection({
  children,
  hideTopMargin = false,
  title,
}: {
  children: ReactNode
  hideTopMargin?: boolean
  title?: string
}): JSX.Element {
  return (
    <section
      className={`page-section w-full ${hideTopMargin ? 'mt-0' : 'mt-10'}`}
    >
      {title && (
        <h2
          className="page-section-title text-2xl w-full
      "
        >
          {title}
        </h2>
      )}

      {children}
    </section>
  )
}
