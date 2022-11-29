import { ReactNode } from 'react'
// eslint-disable-next-line no-restricted-imports
import { ErrorBoundary as ErrorBoundaryReact } from 'react-error-boundary'
import Router from 'next/router'
import { Button } from './Button'

export function ErrorBoundary({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  return (
    <ErrorBoundaryReact FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundaryReact>
  )
}

function ErrorFallback({ error }: { error: Error }): JSX.Element {
  return (
    <div
      className="flex h-full max-w-full flex-col items-center justify-center"
      role="alert"
    >
      <div className="space-y-6 text-center">
        <p>Opps, something went wrong.</p>
        <p>
          <pre className="inline-block break-all">{error.message}</pre>
        </p>
        <Button onClick={Router.reload}>Reload page</Button>
      </div>
    </div>
  )
}
