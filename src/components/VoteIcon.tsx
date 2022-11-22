import { IconDownvote, IconSize, IconUpvote } from './Icon'

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
        <IconUpvote
          className={`hover:text-dsecondary ${
            isVoted ? 'text-dprimary' : 'text-dtertiary'
          }`}
          size={size}
          onClick={onClick}
        />
      ) : (
        variant === 'downvote' && (
          <IconDownvote
            className={`hover:text-dsecondary ${
              isVoted ? 'text-dprimary' : 'text-dtertiary'
            }`}
            size={size}
            onClick={onClick}
          />
        )
      )}
    </span>
  )
}
