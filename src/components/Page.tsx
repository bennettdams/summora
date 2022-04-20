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
  label,
}: {
  children: ReactNode
  hideTopMargin?: boolean
  label?: string
}): JSX.Element {
  return (
    <section
      className={`page-section w-full ${hideTopMargin ? 'mt-0' : 'mt-10'}`}
    >
      {label && (
        <h2 className="page-section-title mb-10 w-full text-2xl text-dorange">
          {label}
        </h2>
      )}

      {children}
    </section>
  )
}
