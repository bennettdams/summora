import { useEffect, useState } from 'react'

/**
 * Determines whether a component has initially mounted.
 * Does not track whether a component dismounts.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}
