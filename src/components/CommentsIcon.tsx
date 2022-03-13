import { IconComment } from './Icon'

export function CommentsIcon({
  noOfComments,
}: {
  noOfComments: number
}): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none">
      <IconComment />
      <span className="ml-1">{noOfComments}</span>
    </span>
  )
}
