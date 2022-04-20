import { ReactNode } from 'react'
import { IconEdit } from './Icon'

export function EditOverlay({
  children,
  isEnabled,
  onClick,
}: {
  children: ReactNode
  isEnabled: boolean
  onClick: () => void
}): JSX.Element {
  return !isEnabled ? (
    <>{children}</>
  ) : (
    <div className="group relative">
      {children}
      <div
        onClick={onClick}
        className="absolute inset-0 hidden place-items-center rounded-xl opacity-50 hover:bg-dbrown group-hover:grid group-hover:transition-colors group-hover:duration-200 group-hover:ease-in-out"
      >
        <IconEdit
          className="text-transparent group-hover:text-white group-hover:opacity-100"
          size="huge"
        />
      </div>
    </div>
  )
}
