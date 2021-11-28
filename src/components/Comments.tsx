import { IconComment } from './Icon'

export function Comments({
  noOfComments,
}: {
  noOfComments: number
}): JSX.Element {
  return (
    <span className="text-gray-400 inline-flex items-center leading-none text-sm">
      {/* <AnnotationIcon className="w-4 h-4 mr-1" /> */}
      <IconComment />
      {noOfComments}
    </span>
  )
}
