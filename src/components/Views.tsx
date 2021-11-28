import { IconView } from './Icon'

export function Views({ noOfViews }: { noOfViews: number }): JSX.Element {
  return (
    <span className="text-gray-400 inline-flex items-center leading-none text-sm">
      <IconView />
      <span className="ml-1">{noOfViews}</span>
    </span>
  )
}
