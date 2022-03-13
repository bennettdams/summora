import { ReactNode } from 'react'
import { IconAdd, IconSize } from './Icon'

interface ButtonProps {
  onClick: () => void
  children?: ReactNode
  disabled?: boolean
}

export function Button({
  onClick,
  children,
  disabled = false,
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        'rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50' +
        ' bg-dlila text-white transition duration-75 ease-in-out hover:bg-dorange' +
        ' disabled:cursor-not-allowed disabled:bg-gray-200'
      }
    >
      {children}
    </button>
  )
}

export function ButtonAdd({
  onClick,
  disabled = false,
  size,
}: ButtonProps & { size?: IconSize }): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        'cursor-pointer rounded-full bg-dlila text-transparent shadow-md duration-150 hover:rotate-90 hover:bg-dorange focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200'
      }
    >
      <IconAdd size={size} onClick={onClick} />
    </button>
  )
}
