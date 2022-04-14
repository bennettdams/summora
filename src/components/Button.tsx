import { ReactNode, useState } from 'react'
import { OmitStrict } from '../types/util-types'
import { IconAdd, IconSize, IconTrash } from './Icon'

interface ButtonProps {
  onClick: () => void
  children?: ReactNode
  disabled?: boolean
}

export function Button({
  onClick,
  children,
  disabled = false,
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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
      <IconAdd size={size} onClick={onClick} />
    </button>
  )
}

export function ButtonRemove({
  onClick,
  disabled = false,
}: OmitStrict<ButtonProps, 'children'>): JSX.Element {
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)

  function handleClick() {
    if (!showRemoveConfirmation) {
      setShowRemoveConfirmation(true)
    } else {
      onClick()
    }
  }

  return (
    <Button onClick={handleClick} disabled={disabled}>
      <div className="group flex items-center">
        {!showRemoveConfirmation ? (
          <div className="flex items-center">
            <IconTrash />
            <span className="ml-1 inline-block">Remove</span>
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
