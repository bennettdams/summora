import { ButtonIcon } from './Button'
import { IconLiked, IconSize, IconUnliked } from './icons'

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
        <ButtonIcon onClick={onClick} icon={<IconLiked size={size} />} />
      ) : (
        <ButtonIcon onClick={onClick} icon={<IconUnliked size={size} />} />
      )}
      <span className="ml-1">{noOfLikes}</span>
    </span>
  )
}
