import { Popover, Transition } from '@headlessui/react'
import { FormEvent, Fragment, useState } from 'react'
import { useUser } from '../data/use-user'
import { ApiUserUpdateRequestBody } from '../services/api-service'
import { Button } from './Button'
import { FormInput } from './FormInput'
import { IconDonate, IconArrowDown, IconCheck, IconX } from './Icon'
import { LinkExternal } from './link'
import { Logo } from './Logo'

function DonationLink({
  userDonation,
}: {
  userDonation: UserDonation
}): JSX.Element {
  return (
    <LinkExternal to={userDonation.donationAddress}>
      <div className="flex-1 rounded-lg p-2 hover:bg-dbrown hover:text-white">
        <div className="flex">
          <div className="grid w-1/2 place-items-center">
            <Logo logoId={userDonation.logoId} />
          </div>

          <div className="w-1/2 text-left">
            <span className="underline">
              {userDonation.donationProviderName}
            </span>
          </div>
        </div>
      </div>
    </LinkExternal>
  )
}

type UserDonation = {
  donationLinkId: string
  donationProviderId: string
  logoId: string
  donationProviderName: string
  donationAddress: string
}

const formId = 'form-donation-links'

type Inputs = {
  donationLinks?: {
    [donationLinkId: string]: {
      donationProviderId: string
      address: string
    }
  }
  newItem?: string | null
}

function UserDonationsUpdates({
  userId,
  userDonations,
}: {
  userId: string
  userDonations: UserDonation[]
}) {
  const { updateUser } = useUser(userId)

  const [inputs, setInputs] = useState<Inputs>()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (inputs) {
}): JSX.Element {
      if (inputs.donationLinks) {
        const tra: ApiUserUpdateRequestBody['donationLinks'] = Object.entries(
          inputs.donationLinks
        ).map(([donationLinkId, inputNew]) => ({
          donationLinkId: donationLinkId,
          donationProviderId: inputNew.donationProviderId,
          address: inputNew.address,
        }))

        await updateUser({
          userId,
          userToUpdate: {
            donationLinks: tra,
          },
        })
      }
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="mx-auto mb-10 w-full space-y-4 lg:w-2/3"
    >
      {userDonations.map((don) => (
        <div className="flex" key={don.donationLinkId}>
          <span>{don.donationProviderName}</span>
          <FormInput
            placeholder="Link.."
            initialValue={don.donationAddress}
            onChange={(input) =>
              setInputs((prev) => ({
                ...prev,
                donationLinks: {
                  ...prev?.donationLinks,
                  [don.donationLinkId]: {
                    address: input,
                    donationProviderId: don.donationProviderId,
                  },
                },
              }))
            }
            autoFocus={false}
            formId={formId}
          />
        </div>
      ))}

      <Button
        isSubmit
        onClick={() => {
          // TODO placeholder, remove when we have FormSubmit button
        }}
      >
        <IconCheck /> Save
      </Button>
      <Button
        onClick={(e) => {
          // prevent form submit
          e.preventDefault()
        }}
      >
        <IconX /> Cancel
      </Button>
    </form>
  )
}

export function UserDonations({
  userDonations,
  isEditMode,
  userId,
}: {
  userDonations: UserDonation[]
} & (
  | { isEditMode?: false; userId?: never }
  | { isEditMode: true; userId: string }
)): JSX.Element {
  return (
    <div className="flex flex-col space-y-4 pl-6 text-left">
      {isEditMode === true ? (
        <UserDonationsUpdates userId={userId} userDonations={userDonations} />
      ) : (
        userDonations.map((userDonation) => (
          <DonationLink
            key={userDonation.donationProviderName}
            userDonation={userDonation}
          />
        ))
      )}
    </div>
  )
}

export function DonateButton({
  userDonations,
}: {
  userDonations: UserDonation[]
}): JSX.Element {
  const hasDonationLinks = userDonations.length > 0

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
              <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative p-7">
                  {hasDonationLinks ? (
                    <div className="grid h-full grid-cols-2">
                      <div className="grid items-center justify-items-end pr-6 text-right">
                        <p className="text-xl text-dlila">Donate via</p>
                      </div>

                      <UserDonations userDonations={userDonations} />
                    </div>
                  ) : (
                    <p className="text-center">
                      This user has not provided any donation links.
                    </p>
                  )}
                </div>

                <div className="bg-dlight p-4">
                  <p className="font-medium text-sm">
                    All donations go <span className="underline">directly</span>{' '}
                    to the author of the post.
                  </p>
                  <p className="font-medium text-sm">
                    As servers are expensive, we might take a cut in the future
                    - but not yet.
                  </p>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
