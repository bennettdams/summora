import { useEffect, type RefObject } from 'react'

export const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  callback: () => void,
  /**
   * Exclude this ref from the "outside click" check. This is useful if e.g. this hook is used to hide
   * a specific ref, but there is also a button to hide that ref (imagine "Show filters"). Without excluding
   * the other ref (here: the button), clicking the button would be considered an outside click.
   * We can therefore ignore outside clicks for the given ref.
   */
  refExclude?: RefObject<HTMLElement>
): void => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // don't execute if the target is the given element
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        (!refExclude?.current
          ? true
          : !refExclude.current.contains(event.target as Node))
      ) {
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
  }, [ref, callback, refExclude])
}
