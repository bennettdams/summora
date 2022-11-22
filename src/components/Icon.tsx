import {
  BookmarkSquareIcon as BookmarkSquareIconOutline,
  BoltIcon as BoltIconOutline,
  CheckCircleIcon as CheckCircleIconOutline,
  HeartIcon as HeartIconOutline,
  ArrowLeftOnRectangleIcon as ArrowLeftOnRectangleIconOutline,
  ArrowRightOnRectangleIcon as ArrowRightOnRectangleIconOutline,
  MinusCircleIcon as MinusCircleIconOutline,
  PlusCircleIcon as PlusCircleIconOutline,
  BellIcon as BellIconOutline,
  UserCircleIcon as UserCircleIconOutline,
  HomeIcon as HomeIconOutline,
} from '@heroicons/react/24/outline'

import {
  Bars3Icon,
  ChatBubbleBottomCenterTextIcon,
  ArrowDownCircleIcon,
  ArrowRightCircleIcon,
  CheckIcon,
  CalendarIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  XMarkIcon,
  SquaresPlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid'

const sizes = {
  small: 'h-4 w-4',
  medium: 'h-6 w-6',
  big: 'h8 w-8',
  huge: 'h-12 w-12',
} as const

export type IconSize = keyof typeof sizes

export interface IconProps {
  size?: IconSize
  // based on the prop type of Heroicons
  className?: Parameters<typeof PlusIcon>[0]['className']
  onClick?: () => void
}

const icons = {
  BookmarkSquareIconOutline,
  BoltIconOutline,
  CheckCircleIconOutline,
  HeartIconOutline,
  ArrowLeftOnRectangleIconOutline,
  ArrowRightOnRectangleIconOutline,
  MinusCircleIconOutline,
  PlusCircleIconOutline,
  BellIconOutline,
  Bars3Icon,
  ChatBubbleBottomCenterTextIcon,
  ArrowDownCircleIcon,
  ArrowRightCircleIcon,
  CheckIcon,
  CalendarIcon,
  ChevronUpDownIcon,
  HomeIconOutline,
  ChevronDownIcon,
  UserCircleIconOutline,
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  XMarkIcon,
  SquaresPlusIcon,
  Squares2X2Icon,
}

type IconName = keyof typeof icons

/** Be aware that using `className` also removes the default color of icons. */
function Icon({
  iconName,
  size = 'medium',
  className,
}: {
  iconName: IconName
  size?: IconProps['size']
  className?: IconProps['className']
}): JSX.Element {
  const IconForName = icons[iconName]

  return (
    <IconForName
      className={`inline-block rounded-full leading-none ${
        className ?? 'text-dsecondary'
      } ${sizes[size]}`}
    />
  )
}

export function IconAdd(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="PlusIcon" />
}

export function IconEdit(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="PencilIcon" />
}

export function IconTrash(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="TrashIcon" />
}

export function IconReply(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ArrowUturnLeftIcon" />
}

export function IconCategory(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="BookmarkSquareIconOutline" />
}

export function IconDate(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="CalendarIcon" />
}

export function IconComment(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ChatBubbleBottomCenterTextIcon" />
}

export function IconView(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="EyeIcon" />
}

export function IconUpvote(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="PlusCircleIconOutline" />
}

export function IconDownvote(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="MinusCircleIconOutline" />
}

export function IconLiked(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="HeartIcon" />
}

export function IconUnliked(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="HeartIconOutline" />
}

export function IconDonate(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="CurrencyDollarIcon" />
}

export function IconArrowDown(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ChevronDownIcon" />
}

export function IconOk(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="CheckIcon" />
}

export function IconSelector(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ChevronUpDownIcon" />
}

export function IconBell(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="BellIconOutline" />
}

export function IconMenu(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="Bars3Icon" />
}

export function IconX(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="XMarkIcon" />
}

export function IconLightning(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="BoltIconOutline" />
}

export function IconOkCircle(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="CheckCircleIconOutline" />
}

export function IconQuestionMarkCircle(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="QuestionMarkCircleIcon" />
}

export function IconShort(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="Squares2X2Icon" />
}

export function IconLong(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="SquaresPlusIcon" />
}

export function IconSignIn(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ArrowLeftOnRectangleIconOutline" />
}

export function IconSignOut(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ArrowRightOnRectangleIconOutline" />
}

export function IconArrowCircleRight(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ArrowRightCircleIcon" />
}

export function IconArrowCircleDown(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ArrowDownCircleIcon" />
}

export function IconHome(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="HomeIconOutline" />
}

export function IconUser(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="UserCircleIconOutline" />
}
