import {
  AcademicCapIcon as AcademicCapIconOutline,
  ArrowLeftOnRectangleIcon as ArrowLeftOnRectangleIconOutline,
  ArrowPathIcon as ArrowPathIconOutline,
  ArrowRightOnRectangleIcon as ArrowRightOnRectangleIconOutline,
  BanknotesIcon as BanknotesIconOutline,
  BellIcon as BellIconOutline,
  BoltIcon as BoltIconOutline,
  BookmarkSquareIcon as BookmarkSquareIconOutline,
  CheckCircleIcon as CheckCircleIconOutline,
  EllipsisHorizontalIcon as EllipsisHorizontalIconOutline,
  HeartIcon as HeartIconOutline,
  HomeIcon as HomeIconOutline,
  LightBulbIcon as LightBulbIconOutline,
  MagnifyingGlassIcon as MagnifyingGlassIconOutline,
  MinusCircleIcon as MinusCircleIconOutline,
  PlusCircleIcon as PlusCircleIconOutline,
  SparklesIcon as SparklesIconOutline,
  Square3Stack3DIcon as Square3Stack3DIconOutline,
  UserCircleIcon as UserCircleIconOutline,
} from '@heroicons/react/24/outline'

import {
  ArrowDownCircleIcon,
  ArrowRightCircleIcon,
  ArrowUturnLeftIcon,
  Bars3Icon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  EyeIcon,
  FunnelIcon,
  HeartIcon,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
  TrashIcon,
  XMarkIcon,
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
  MagnifyingGlassIconOutline,
  AcademicCapIconOutline,
  LightBulbIconOutline,
  BanknotesIconOutline,
  EllipsisHorizontalIconOutline,
  FunnelIcon,
  SparklesIconOutline,
  ArrowPathIconOutline,
  Square3Stack3DIconOutline,
  EnvelopeIcon,
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

export function IconNotification(props: IconProps): JSX.Element {
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

export function IconSearch(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="MagnifyingGlassIconOutline" />
}

export function IconKnowledge(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="AcademicCapIconOutline" />
}

export function IconIdea(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="LightBulbIconOutline" />
}

export function IconMoney(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="BanknotesIconOutline" />
}

export function IconOptions(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="EllipsisHorizontalIconOutline" />
}

export function IconFilter(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="FunnelIcon" />
}

export function IconExplore(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="SparklesIconOutline" />
}

export function IconRefresh(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="ArrowPathIconOutline" />
}

export function IconSource(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="Square3Stack3DIconOutline" />
}

export function IconMail(props: IconProps): JSX.Element {
  return <Icon {...props} iconName="EnvelopeIcon" />
}
