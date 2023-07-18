import { ButtonIcon } from './Button'
import {
  IconComment,
  IconDownvote,
  IconLiked,
  IconSize,
  IconUnliked,
  IconUpvote,
  IconView,
} from './icons'

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

export function VoteIcon({
  variant,
  isVoted,
  onClick,
  size = 'medium',
}: {
  variant: 'upvote' | 'downvote'
  isVoted: boolean
  onClick: () => void
  size?: IconSize
}): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none">
      {variant === 'upvote' ? (
        <ButtonIcon
          onClick={onClick}
          icon={
            <IconUpvote
              className={`hover:text-dsecondary ${
                isVoted ? 'text-dprimary' : 'text-dtertiary'
              }`}
              size={size}
            />
          }
        />
      ) : (
        variant === 'downvote' && (
          <ButtonIcon
            onClick={onClick}
            icon={
              <IconDownvote
                className={`hover:text-dsecondary ${
                  isVoted ? 'text-dprimary' : 'text-dtertiary'
                }`}
                size={size}
              />
            }
          />
        )
      )}
    </span>
  )
}

export function CommentsIcon({
  noOfComments,
}: {
  noOfComments: number
}): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none">
      {/* min-w-0 so the icon is not squeezed */}
      <div className="min-w-0">
        <IconComment size="small" />
      </div>
      <span className="ml-1">{noOfComments}</span>
    </span>
  )
}

export function ViewsIcon({ noOfViews }: { noOfViews: number }): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none">
      {/* min-w-0 so the icon is not squeezed */}
      <div className="min-w-0">
        <IconView size="small" />
      </div>
      <span className="ml-1">{noOfViews}</span>
    </span>
  )
}
