import { Dialog, Transition } from '@headlessui/react'
import { Fragment, KeyboardEvent, ReactNode, useRef, useState } from 'react'
import { OmitStrict } from '../types/util-types'
import { Button } from './Button'
import { Title } from './Title'

interface ModalControl {
  isOpen: boolean
  open: () => void
  close: () => void
}

export function useModal(): ModalControl {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return { isOpen, open, close }
}

/**
 * There are two "modes" for the Modal's height:
 *
 *  1) Default: not "enough" content to fill the viewport height: the Modal is just as high as the content
 *  2) force full height (via prop): controlled via prop, Modal always has full height. This comes handy when you need
 *     to have a "fixed" given height of the Modal container, e.g. for "react-window", which needs a height to calculate.
 *
 * Additionally: If the content is supposed to be higher than the Modal's max height, use the "isContentScrollable" prop,
 * which makes the content y-scrollable.
 * By default, the scrollbars are deactivated, because they would be shown for content that is too high and therefore
 * overlap with the real scrollbar of the content.
 *
 * @param subheader Can be used to pass additional JSX that will be shown below the header and above the content area.
 */
export function Modal({
  isOpen,
  close,
  children,
  title,
  onConfirm,
  subtitle,
  forceFullHeight = false,
  forceFullWidth = false,
  forceHalfWidth = false,
  isContentScrollable = false,
  subheader,
  buttonSecondaryText,
  onClickSecondaryButton,
  isSubmit,
}: OmitStrict<ModalControl, 'open'> & {
  title?: string
  children: ReactNode
  onConfirm?: () => Promise<void>
  subtitle?: string
  forceFullHeight?: boolean // by default, the Modal will have a height based on the content.
  isContentScrollable?: boolean
  subheader?: ReactNode
  isSubmit?: boolean
} & (
    | { buttonSecondaryText: string; onClickSecondaryButton: () => void }
    | { buttonSecondaryText?: never; onClickSecondaryButton?: never }
  ) &
  // by default, the Modal will have a width based on the content up until a max width.
  (| { forceFullWidth?: boolean; forceHalfWidth?: never }
    | { forceFullWidth?: never; forceHalfWidth?: boolean }
  )): JSX.Element {
  async function handleConfirm() {
    if (onConfirm) await onConfirm()
    close()
  }

  /**
   * Used to initially focus the button.
   */
  const confirmButtonRef = useRef(null)

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        id="modal"
        className="fixed inset-0 z-50 overflow-x-hidden overflow-y-hidden text-indigo-800"
        static
        onClose={close}
        initialFocus={confirmButtonRef}
      >
        <div
          className="min-h-screen px-4 text-center"
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              event.stopPropagation()
              handleConfirm()
            }
          }}
        >
          {/* BACKROP */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-gray-400 bg-opacity-50"
              aria-hidden="true"
            />
          </Transition.Child>

          {/* CONTENT */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-75"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel
                as="div"
                className={
                  'inline-flex max-w-screen-2xl flex-col overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl' +
                  ` ${forceFullWidth && 'w-full'}` +
                  ` ${forceHalfWidth && 'w-1/2'}` +
                  ` ${forceFullHeight && 'h-screen'}`
                }
                style={{ maxHeight: '90vh' }}
              >
                {title && (
                  <Dialog.Title as="div" className="text-center">
                    <Title>{title}</Title>
                  </Dialog.Title>
                )}

                {subtitle && (
                  <div className="w-full text-center">
                    <h1 className="text-xl italic text-indigo-800">
                      {subtitle}
                    </h1>
                  </div>
                )}

                {subheader}

                <Dialog.Description
                  as="div"
                  className={
                    'mt-4 w-full flex-grow overflow-x-hidden' +
                    ` ${
                      !isContentScrollable
                        ? 'overflow-y-hidden'
                        : 'h-full overflow-y-scroll'
                    }`
                  }
                >
                  {children}
                </Dialog.Description>

                <div className="mt-4 flex justify-end">
                  {!!buttonSecondaryText && (
                    <div className="mr-6 inline">
                      <Button
                        onClick={onClickSecondaryButton}
                        isSubmit={isSubmit}
                        // variant="secondary"
                      >
                        {buttonSecondaryText}
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleConfirm}
                    // refExternal={confirmButtonRef}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
