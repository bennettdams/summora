import { useEffect, type RefObject } from 'react'

export const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  callback: () => void
): void => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // don't execute if the taget is the given element
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
