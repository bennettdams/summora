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
        ' bg-green-200 transition duration-75 ease-in-out hover:bg-green-300' +
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
        'cursor-pointer rounded-full bg-gradient-to-br from-orange-500 to-lime-600 text-transparent shadow-md hover:from-orange-300 hover:to-lime-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200'
      }
    >
      <IconAdd size={size} onClick={onClick} />
    </button>
  )
}
