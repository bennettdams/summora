import { RefObject, useEffect } from 'react'

export const useOnClickOutside = (
  ref: RefObject<HTMLDivElement>,
  callback: () => void
): void => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // TODO needed?
        // if (document.activeElement === ref.current) {
        callback()
        // }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}
