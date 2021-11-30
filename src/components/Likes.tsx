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
        <IconLiked onClick={onClick} />
      ) : (
        <IconUnliked onClick={onClick} />
      )}
      <span>{noOfLikes}</span>
    </div>
  )
}
