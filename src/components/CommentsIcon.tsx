import { IconComment } from './Icon'

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
