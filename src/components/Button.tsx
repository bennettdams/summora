import {
  cloneElement,
  isValidElement,
  MouseEvent,
  ReactNode,
  useRef,
  useState,
} from 'react'
import { OmitStrict } from '../types/util-types'
import { useOnClickOutside } from '../util/use-on-click-outside'
import {
  IconAdd,
  IconProps,
  IconQuestionMarkCircle,
  IconSize,
  IconTrash,
} from './icons'
import { LoadingAnimation } from './LoadingAnimation'

export interface ButtonProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  children?: ReactNode
  disabled?: boolean
  onClickOutside?: () => void
  isSubmit?: boolean
  icon?: ReactNode
  showLoading?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  onClick,
  children,
  icon,
  disabled = false,
  onClickOutside,
  showLoading = false,
  isSubmit = false,
  isBig = false,
  variant = 'primary',
}: ButtonProps & { isBig?: boolean }): JSX.Element {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useOnClickOutside(buttonRef, onClickOutside ?? (() => undefined))

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      ref={buttonRef}
      type={isSubmit ? 'submit' : 'button'}
      className={
        'group shadow-md outline-none transition duration-200 focus:outline-none disabled:cursor-not-allowed' +
        // keep in sync with "Choice" component
        '  text-white ring-orange-500 hover:bg-none disabled:text-gray-300' +
        ` ${
          variant === 'primary'
            ? 'bg-dprimary bg-gradient-to-r from-dprimary to-dprimary/90 hover:bg-pink-900 active:bg-dprimary/40'
            : 'bg-dsecondary bg-gradient-to-r from-dsecondary to-dsecondary/90 hover:bg-blue-900 active:bg-dsecondary/40'
        }` +
        ` ${
          !isBig
            ? 'rounded px-2 py-2 text-base'
            : 'rounded-xl px-8 py-6 text-xl'
        }`
      }
    >
      <div className="flex items-center justify-center">
        {icon && (
          <span
            className={`w-6 leading-none text-dtertiary group-hover:text-white ${
              isBig ? 'mr-3' : 'mr-1'
            }`}
          >
            {showLoading ? (
              <LoadingAnimation light size="small" />
            ) : // overwrite the icon color for the appropiate text color of the button
            isValidElement<IconProps>(icon) ? (
              cloneElement<IconProps>(icon, {
                className: 'text-current',
                size: isBig ? 'big' : undefined,
              })
            ) : (
              <></>
            )}
          </span>
        )}
        <span>{children}</span>
      </div>
    </button>
  )
}

export function ButtonAddSpecial({
  onClick,
  disabled = false,
  size,
}: ButtonProps & { size?: IconSize }): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer rounded-full bg-dprimary text-transparent text-white shadow-md duration-150 hover:rotate-90 hover:bg-dsecondary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200"
    >
      <IconAdd size={size} className="text-white" />
    </button>
  )
}

export function ButtonRemove(props: ButtonProps): JSX.Element {
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (!showRemoveConfirmation) {
      setShowRemoveConfirmation(true)
    } else {
      props.onClick?.(e)
    }
  }

  return (
    <Button
      {...props}
      onClick={handleClick}
      onClickOutside={() => setShowRemoveConfirmation(false)}
      icon={
        !showRemoveConfirmation ? <IconTrash /> : <IconQuestionMarkCircle />
      }
    >
      <div className="group flex items-center">
        {!showRemoveConfirmation ? props.children ?? 'Remove' : 'Confirm'}
      </div>
    </Button>
  )
}

export function ButtonAdd(
  props: OmitStrict<ButtonProps, 'icon'> & { isBig?: boolean },
): JSX.Element {
  return (
    <Button icon={<IconAdd />} {...props}>
      {props.children ?? <span>Add</span>}
    </Button>
  )
}

/** Only used for clickable icons. */
export function ButtonIcon({
  onClick,
  disabled = false,
  icon,
}: OmitStrict<ButtonProps, 'icon' | 'onClick'> & {
  onClick: NonNullable<ButtonProps['onClick']>
  icon: NonNullable<ButtonProps['icon']>
}): JSX.Element {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    onClick(e)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="cursor-pointer rounded-full text-dsecondary duration-150 hover:rotate-12 hover:text-dtertiary focus:outline-dprimary disabled:cursor-not-allowed disabled:text-gray-400"
    >
      {
        // overwrite the icon color for the appropiate text color of the button
        isValidElement<IconProps>(icon) ? (
          cloneElement<IconProps>(icon, {
            className: icon.props.className ?? 'text-current',
          })
        ) : (
          <></>
        )
      }
    </button>
  )
}
