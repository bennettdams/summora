import { IconComment } from './Icon'

export function Comments({
  noOfComments,
}: {
  noOfComments: number
}): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none text-gray-400">
      <IconComment />
      <span className="ml-1">{noOfComments}</span>
    </span>
  )
}
