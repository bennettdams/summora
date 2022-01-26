import { IconLiked, IconSize, IconUnliked } from './Icon'

export function LikesIcon({
  isLiked,
  noOfLikes,
  onClick,
  size = 'medium',
}: {
  isLiked: boolean
  noOfLikes: number
  onClick: () => void
  size?: IconSize
}): JSX.Element {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center text-sm leading-none text-gray-400"
    >
      {isLiked ? <IconLiked size={size} /> : <IconUnliked size={size} />}
      <span className="ml-1">{noOfLikes}</span>
    </span>
  )
}
