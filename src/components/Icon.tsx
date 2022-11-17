import {
  BookmarkSquareIcon as BookmarkSquareIconOutline,
  BoltIcon as BoltIconOutline,
  CheckCircleIcon as CheckCircleIconOutline,
  HeartIcon as HeartIconOutline,
  ArrowLeftOnRectangleIcon as ArrowLeftOnRectangleIconOutline,
  MinusCircleIcon as MinusCircleIconOutline,
  PlusCircleIcon as PlusCircleIconOutline,
  BellIcon as BellIconOutline,
} from '@heroicons/react/24/outline'

import {
  Bars3Icon,
  ChatBubbleBottomCenterIcon,
  ArrowDownCircleIcon,
  ArrowRightCircleIcon,
  CheckIcon,
  CalendarIcon,
  ChevronUpDownIcon,
  ChevronDownIcon as ChevronDownIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  EyeIcon,
  HeartIcon as HeartIconSolid,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  ArrowUturnLeftIcon,
  TrashIcon,
  XMarkIcon,
  SquaresPlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid'
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

export interface IconProps {
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
    <ArrowUturnLeftIcon
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
    <BookmarkSquareIconOutline
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
    <ChatBubbleBottomCenterIcon
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
          event.preventDefault()
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
          event.preventDefault()
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

export function IconOk({
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

export function IconSelector({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <ChevronUpDownIcon
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

export function IconBell({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <BellIconOutline
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

export function IconMenu({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <Bars3Icon
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
    <XMarkIcon
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

export function IconLightning({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <BoltIconOutline
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

export function IconOkCircle({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <CheckCircleIconOutline
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

export function IconQuestionMarkCircle({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <QuestionMarkCircleIconSolid
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

export function IconShort({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <Squares2X2Icon
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

export function IconLong({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <SquaresPlusIcon
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

export function IconSignIn({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <ArrowLeftOnRectangleIconOutline
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

export function IconArrowCircleRight({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <ArrowRightCircleIcon
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

export function IconArrowCircleDown({
  size = 'medium',
  className,
  onClick,
}: IconProps): JSX.Element {
  return (
    <ArrowDownCircleIcon
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
