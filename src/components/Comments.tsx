import { ReactNode } from 'react'
import { AnnotationIcon } from '@heroicons/react/solid'

export function Comments({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="text-gray-400 inline-flex items-center leading-none text-sm">
      <AnnotationIcon className="w-4 h-4 mr-1" />
      {children}
    </span>
  )
}
