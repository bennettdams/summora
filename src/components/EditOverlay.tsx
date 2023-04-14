import { ReactNode } from 'react'
import { IconEdit } from './Icon'

export function EditOverlay({
  children,
  isEnabled,
  onClick,
}: {
  children: ReactNode
  isEnabled: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <div className="group relative z-10">
      {children}
      {isEnabled && (
        <div
          onClick={() => isEnabled && onClick()}
          /*
           * We use conditional CSS instead of conditional rendering so the children are not re-/mounted.
           * This is e.g. needed because there is bug in React where unmounting does not trigger `onBlur`.
           * See: https://github.com/facebook/react/issues/12363
           */
          className={
            'absolute inset-0 grid place-items-center rounded-xl bg-dtertiary opacity-50' +
            ' hover:bg-dtertiary group-hover:grid group-hover:transition-colors group-hover:duration-200 group-hover:ease-in-out lg:bg-transparent'
          }
        >
          <IconEdit
            className="text-white group-hover:text-white group-hover:opacity-100 lg:text-transparent"
            size="huge"
          />
        </div>
      )}
    </div>
  )
}
