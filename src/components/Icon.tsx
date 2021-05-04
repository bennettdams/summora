import {
  PencilAltIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  PlusCircleIcon,
} from '@heroicons/react/solid'
import { MouseEvent } from 'react'

const sizes = {
  small: 'h-4 w-4',
  medium: 'h-6 w-6',
  big: 'h8 w-8',
  huge: 'h-12 w-12',
} as const

// function Debug() {
//   return (
//     <div className="text-orange-600 bg-orange-100 hover:text-orange-800 transition ease-in duration-75 transform hover:scale-110"></div>
//   )
// }

const style =
  'leading-none text-orange-600 rounded-full hover:bg-orange-200 hover:shadow-sm hover:text-orange-800 transition ease-in duration-75 transform hover:scale-110'

export interface IconProps {
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
      className={`${style} ${sizes[size]} ${className} ${
        onClick && 'cursor-pointer'
      }`}
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
      className={`${style} ${sizes[size]} ${className} ${
        onClick && 'cursor-pointer'
      }`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}
// lassName={`w-16 h-16 mt-8 mx-auto focus:outline-none focus:shadow-outline bg-transparent border border-orange-400 rounded-full text-xl shadow-lg flex justify-center items-center`}
export function IconAdd({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <PlusCircleIcon
      className={
        'cursor-pointer text-white border bg-gradient-to-br from-orange-500 to-lime-600 rounded-full shadow-md transition ease-in-out transform hover:rotate-90 hover:scale-105 duration-200' +
        ` ${sizes[size]} ${className}`
      }
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
      className={`${style} ${sizes[size]} ${className} ${
        onClick && 'cursor-pointer'
      }`}
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
      className={`${style} ${sizes[size]} ${className} ${
        onClick && 'cursor-pointer'
      }`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}
