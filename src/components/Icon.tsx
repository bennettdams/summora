import {
  PencilAltIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
} from '@heroicons/react/solid'
import { MouseEvent } from 'react'

const sizes = {
  small: 'h-4 w-4',
  medium: 'h-6 w-6',
} as const

function Debug() {
  return (
    <div className="text-orange-600 bg-orange-100 hover:text-orange-800 transition ease-in duration-75 transform hover:scale-110"></div>
  )
}

const style =
  'leading-none text-orange-600 rounded-full hover:bg-orange-200 hover:shadow-sm hover:text-orange-800 transition ease-in duration-75 transform hover:scale-110'

interface IconProps {
  size?: keyof typeof sizes
  className?: string
  onClick?: () => void
}

export function IconEdit({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <PencilAltIcon
      className={`${style} ${sizes[size]} ${className}`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}

export function IconCheck({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <CheckIcon
      className={`${style} ${sizes[size]} ${className}`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}

export function IconX({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <XIcon
      className={`${style} ${sizes[size]} ${className}`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}

export function IconTrash({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <TrashIcon
      className={`${style} ${sizes[size]} ${className}`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}
