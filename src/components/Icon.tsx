import {
  PencilAltIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  PlusIcon,
  ReplyIcon,
  CalendarIcon,
  AnnotationIcon,
  EyeIcon,
} from '@heroicons/react/solid'
import { BookmarkAltIcon } from '@heroicons/react/outline'
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
  // based on the prop type of Heroicons
  className?: Parameters<typeof PlusIcon>[0]['className']
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
    <PlusIcon
      className={'text-white' + ` ${sizes[size]} ${className}`}
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

export function IconReply({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <ReplyIcon
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

export function IconCategory({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <BookmarkAltIcon
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

export function IconDate({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <CalendarIcon
      className={` ${style} ${className} ${sizes[size]} ${
        onClick && 'cursor-pointer'
      }`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}

export function IconComment({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <AnnotationIcon
      className={` ${style} ${className} ${sizes[size]} ${
        onClick && 'cursor-pointer'
      }`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}

export function IconView({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <EyeIcon
      className={` ${style} ${className} ${sizes[size]} ${
        onClick && 'cursor-pointer'
      }`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        onClick && onClick()
      }}
    />
  )
}

