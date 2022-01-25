import { IconView } from './Icon'

export function Views({ noOfViews }: { noOfViews: number }): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none text-gray-400">
      <IconView />
      <span className="ml-1">{noOfViews}</span>
    </span>
  )
}
