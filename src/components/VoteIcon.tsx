import { ButtonIcon } from './Button'
import { IconDownvote, IconSize, IconUpvote } from './icons'

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
