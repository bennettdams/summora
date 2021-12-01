import { IconLiked, IconUnliked } from './Icon'

export function Likes({
  isLiked,
  noOfLikes,
  onClick,
}: {
  isLiked: boolean
  noOfLikes: number
  onClick: () => void
}): JSX.Element {
  return (
    <div className="inline text-center">
      {isLiked ? (
        <IconLiked size="big" onClick={onClick} />
      ) : (
        <IconUnliked size="big" onClick={onClick} />
      )}
      <span>{noOfLikes}</span>
    </div>
  )
}
