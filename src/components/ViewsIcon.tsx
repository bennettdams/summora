import { IconView } from './Icon'

export function ViewsIcon({ noOfViews }: { noOfViews: number }): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none">
      <IconView />
      <span className="ml-1">{noOfViews}</span>
    </span>
  )
}
