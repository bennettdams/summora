import { Popover, Transition } from '@headlessui/react'
import { ReactNode, Fragment } from 'react'
import { IconDonate, IconArrowDown } from './Icon'
import { LogoPayPal, LogoBitcoin } from './logo'

function DonationLink({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex items-center text-lg hover:text-dlila hover:underline">
      <LogoPayPal />
      <LogoBitcoin />
      <span className="ml-2">{children}</span>
    </div>
  )
}

function UserDonations(): JSX.Element {
  return (
    <div className="grid h-full grid-cols-2">
      <div className="grid items-center justify-items-end pr-6 text-right">
        <p className="text-xl text-dlila">Donate via</p>
      </div>
      <div className="flex flex-col space-y-4 pl-6 text-left">
        <div className="flex-1">
          <DonationLink>PayPal</DonationLink>
        </div>
        <div className="flex-1">
          <DonationLink>Bitcoin</DonationLink>
        </div>
      </div>
    </div>
  )
}

export function DonateButton(): JSX.Element {
  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            className={`
                  ${open ? '' : 'text-opacity-90'}
                  font-medium group inline-flex items-center rounded-md bg-dorange px-3 py-2 text-base text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
          >
            <IconDonate className="text-dlight" />
            <span className="ml-2 font-semibold">Donate</span>

            <IconArrowDown
              className={`${open ? '' : 'text-opacity-70'}
                    ml-2 h-5 w-5 text-orange-300 transition duration-150 ease-in-out group-hover:text-opacity-80`}
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-xl">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative bg-white p-7">
                  <UserDonations />
                </div>

                <div className="bg-dlight p-4">
                  {/* <a
                      href="##"
                      className="flow-root rounded-md px-2 py-2 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                    > */}
                  <p className="font-medium text-sm">
                    All donations go <span className="underline">directly</span>{' '}
                    to the author of the post.
                  </p>
                  <p className="font-medium text-sm">
                    As servers are expensive, we might take a cut in the future
                    - but not yet.
                  </p>
                  {/* </a> */}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
