import {
  PencilIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  PlusIcon,
  ReplyIcon,
  CalendarIcon,
  AnnotationIcon,
  EyeIcon,
  HeartIcon as HeartIconSolid,
  ChevronDownIcon as ChevronDownIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
} from '@heroicons/react/solid'
import {
  BookmarkAltIcon,
  HeartIcon as HeartIconOutline,
  PlusCircleIcon as PlusCircleIconOutline,
  MinusCircleIcon as MinusCircleIconOutline,
} from '@heroicons/react/outline'
import { MouseEvent } from 'react'

const sizes = {
  small: 'h-4 w-4',
  medium: 'h-6 w-6',
  big: 'h8 w-8',
  huge: 'h-12 w-12',
} as const

const style = 'leading-none rounded-full'

const clickableStyle =
  'cursor-pointer transition ease-in duration-75 transform hover:scale-110 hover:text-dlila hover:shadow-sm'

function createClassNames({
  size,
  className,
  isClickable,
}: {
  size: IconSize
  isClickable: boolean
  className?: string
}) {
  return `${style} ${sizes[size]} ${className ?? 'text-dorange'} ${
    isClickable && clickableStyle
  }`
}

export type IconSize = keyof typeof sizes

interface IconProps {
  size?: IconSize
  // based on the prop type of Heroicons
  className?: Parameters<typeof PlusIcon>[0]['className']
  onClick?: () => void
}

// CUSTOM ICONS
export function IconAdd({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <PlusIcon
      className={`text-white ${sizes[size]} ${className ?? 'text-dorange'}`}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}

// DEFAULT ICONS
export function IconEdit({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <PencilIcon
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
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
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}

export function IconUpvote({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <PlusCircleIconOutline
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}

export function IconDownvote({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <MinusCircleIconOutline
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}

export function IconLiked({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <HeartIconSolid
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}

export function IconUnliked({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <HeartIconOutline
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}

export function IconDonate({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <CurrencyDollarIconSolid
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}

export function IconArrowDown({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <ChevronDownIconSolid
      className={createClassNames({
        size,
        className,
        isClickable: !!onClick,
      })}
      onClick={(event: MouseEvent) => {
        if (onClick) {
          event.stopPropagation()
          onClick()
        }
      }}
    />
  )
}
