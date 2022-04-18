import { MouseEvent, ReactNode, useRef, useState } from 'react'
import { useOnClickOutside } from '../util/use-on-click-outside'
import { IconAdd, IconSize, IconTrash } from './Icon'

interface ButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  children?: ReactNode
  disabled?: boolean
  onClickOutside?: () => void
  isSubmit?: boolean
}

type ButtonOnClickEvent = Parameters<ButtonProps['onClick']>[0]

export function Button({
  onClick,
  children,
  disabled = false,
  onClickOutside,
  isSubmit = false,
}: ButtonProps): JSX.Element {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useOnClickOutside(buttonRef, onClickOutside ?? (() => undefined))

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      ref={buttonRef}
      type={isSubmit ? 'submit' : 'button'}
      className={
        'inline-flex items-center' +
        ' rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50' +
        ' bg-dlila text-white transition duration-75 ease-in-out hover:bg-dorange' +
        ' disabled:cursor-not-allowed disabled:bg-gray-200'
      }
    >
      {children}
    </button>
  )
}

export function ButtonAdd({
  onClick,
  disabled = false,
  size,
}: ButtonProps & { size?: IconSize }): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        'cursor-pointer rounded-full bg-dlila text-transparent shadow-md duration-150 hover:rotate-90 hover:bg-dorange hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200'
      }
    >
      <IconAdd size={size} />
    </button>
  )
}

export function ButtonRemove(props: ButtonProps): JSX.Element {
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)

  function handleClick(e: ButtonOnClickEvent) {
    if (!showRemoveConfirmation) {
      setShowRemoveConfirmation(true)
    } else {
      props.onClick(e)
    }
  }

  return (
    <Button
      {...props}
      onClick={handleClick}
      onClickOutside={() => setShowRemoveConfirmation(false)}
    >
      <div className="group flex items-center">
        {!showRemoveConfirmation ? (
          <div className="flex items-center">
            <IconTrash />
            <span className="ml-1 inline-block">
              {props.children ?? 'Remove'}
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <IconTrash />
            <span className="ml-1 inline-block ">Confirm</span>
          </div>
        )}
      </div>
    </Button>
  )
}
