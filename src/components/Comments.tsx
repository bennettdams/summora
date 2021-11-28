import { IconComment } from './Icon'

export function Comments({
  noOfComments,
}: {
  noOfComments: number
}): JSX.Element {
  return (
    <span className="text-gray-400 inline-flex items-center leading-none text-sm">
      <IconComment />
      <span className="ml-1">{noOfComments}</span>
    </span>
  )
}
