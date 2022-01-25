import { ReactNode } from 'react'

export function Page({
  children,
  pageHeader,
}: {
  children: ReactNode
  pageHeader?: ReactNode
}): JSX.Element {
  return (
    <div className="page mt-16 w-full pb-32">
      {pageHeader && pageHeader}
      <main className="container mx-auto mt-20 w-full pb-32">{children}</main>
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
        <h2 className="page-section-title mb-10 w-full text-2xl">{title}</h2>
      )}

      {children}
    </section>
  )
}
