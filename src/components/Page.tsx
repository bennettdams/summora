import { ReactNode } from 'react'
import { Title } from './Title'

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
      <main className="container mx-auto mt-20 w-full px-4 pb-32 md:px-6 lg:px-0">
        {children}
      </main>
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
      className={`page-section w-full ${hideTopMargin ? 'mt-0' : 'mt-28'}`}
    >
      {label && (
        <div className="page-section-title mb-10 w-full text-center">
          <Title>{label}</Title>
        </div>
      )}

      {children}
    </section>
  )
}
