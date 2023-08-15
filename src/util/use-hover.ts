import { MutableRefObject, useEffect, useRef, useState } from 'react'

export function useHover<T extends HTMLElement>(
  onEnter?: () => void,
  onLeave?: () => void,
): [MutableRefObject<T | null>, boolean] {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const ref = useRef<T | null>(null)

  const handleMouseOver = (): void => {
    setIsHovered(true)
    onEnter && onEnter()
  }

  const handleMouseOut = (): void => {
    setIsHovered(false)
    onLeave && onLeave()
  }

  useEffect(
    () => {
      const node = ref.current
      if (node) {
        node.addEventListener('mouseover', handleMouseOver)
        node.addEventListener('mouseout', handleMouseOut)

        return () => {
          node.removeEventListener('mouseover', handleMouseOver)
          node.removeEventListener('mouseout', handleMouseOut)
        }
      }
    },
    [ref.current], // Recall only if ref changes
  )

  return [ref, isHovered]
}
