import { MutableRefObject, useState, useRef, useEffect } from 'react'

export function useHover<T>(
  onEnter?: () => void,
  onLeave?: () => void
): [MutableRefObject<T>, boolean] {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const ref: any = useRef<T | null>(null)

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
      const node: any = ref.current
      if (node) {
        node.addEventListener('mouseover', handleMouseOver)
        node.addEventListener('mouseout', handleMouseOut)

        return () => {
          node.removeEventListener('mouseover', handleMouseOver)
          node.removeEventListener('mouseout', handleMouseOut)
        }
      }
    },
    [ref.current] // Recall only if ref changes
  )

  return [ref, isHovered]
}
