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
    <span className="inline-flex items-center text-sm leading-none">
      {isLiked ? (
        <IconLiked size={size} onClick={onClick} />
      ) : (
        <IconUnliked size={size} onClick={onClick} />
      )}
      <span className="ml-1">{noOfLikes}</span>
    </span>
  )
}
