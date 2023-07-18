import { IconView } from './icons'

export function ViewsIcon({ noOfViews }: { noOfViews: number }): JSX.Element {
  return (
    <span className="inline-flex items-center text-sm leading-none">
      {/* min-w-0 so the icon is not squeezed */}
      <div className="min-w-0">
        <IconView size="small" />
      </div>
      <span className="ml-1">{noOfViews}</span>
    </span>
  )
}
