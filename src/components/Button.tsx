import { ReactNode } from 'react'
import { IconAdd, IconProps } from './Icon'

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
        'p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50' +
        ' transition duration-75 ease-in-out bg-green-200 hover:bg-green-300 transform hover:-translate-y-1 hover:scale-105' +
        ' disabled:bg-gray-200 disabled:cursor-not-allowed'
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
}: ButtonProps & { size?: IconProps['size'] }): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        'disabled:bg-gray-200 disabled:cursor-not-allowed focus:outline-none'
      }
    >
      <IconAdd size={size} onClick={onClick} />
    </button>
  )
}
