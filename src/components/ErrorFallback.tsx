import { useRouter } from 'next/router'
import { Button } from './Button'

export function ErrorFallback({
  error,
}: // resetErrorBoundary
{
  error: Error
}) {
  const router = useRouter()

  return (
    <div role="alert">
      <p>Opps, something went wrong:</p>
      <pre>{error.message ?? error}</pre>

      <Button onClick={() => router.reload()}>Try again?</Button>
    </div>
  )
}
