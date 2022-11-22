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
} from './Icon'
import { LoadingAnimation } from './LoadingAnimation'

export interface ButtonProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  children?: ReactNode
  disabled?: boolean
  onClickOutside?: () => void
  isSubmit?: boolean
  icon?: ReactNode
  showLoading?: boolean
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
        'group shadow-md outline-none focus:outline-none disabled:cursor-not-allowed' +
        // keep in sync with "Choice" component
        ' bg-dprimary bg-gradient-to-r from-dprimary to-dprimary/90 text-white ring-orange-500 hover:bg-pink-900 hover:bg-none active:bg-dprimary/40 disabled:text-gray-300' +
        ` ${!isBig ? 'rounded py-2 px-2' : 'rounded-xl px-8 py-6 text-xl'}`
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
  props: OmitStrict<ButtonProps, 'icon'> & { isBig?: boolean }
): JSX.Element {
  return (
    <Button icon={<IconAdd />} {...props}>
      {props.children ?? <span>Add</span>}
    </Button>
  )
}
