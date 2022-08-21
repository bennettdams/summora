import { Popover, Transition } from '@headlessui/react'
import { FormEvent, Fragment, useState } from 'react'
import { InferMutationInput, trpc } from '../util/trpc'
import { Button, ButtonRemove } from './Button'
import { DropdownSelect } from './DropdownSelect'
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
            <Logo
              topic="donationProviderId"
              logoIdForAccess={userDonation.logoId}
            />
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

type DonationProviderSelectItem = { donationProviderId: string; name: string }

function DonationProviderSelect({
  donationProviders,
  onSelect,
  initialItem,
  shouldReset,
}: {
  donationProviders: DonationProviderSelectItem[] | null
  onSelect: (selectedProviderId: string) => void
  initialItem?: DonationProviderSelectItem
  shouldReset?: boolean
}): JSX.Element {
  return (
    <DropdownSelect
      unselectedLabel="Please select a provider."
      shouldReset={shouldReset}
      initialItem={
        !initialItem
          ? undefined
          : {
              id: initialItem.donationProviderId,
              label: initialItem.name,
            }
      }
      items={
        !donationProviders
          ? null
          : donationProviders?.map((provider) => ({
              id: provider.donationProviderId,
              label: provider.name,
            }))
      }
      onChange={(newItem) => {
        onSelect(newItem.id)
      }}
    />
  )
}

type UserDonation = {
  donationLinkId: string
  donationProviderId: string
  logoId: string
  donationProviderName: string
  donationAddress: string
}

type DonationLinkInput = InferMutationInput<'donationLink.edit'>['data']
type Inputs = {
  [donationLinkId: string]: DonationLinkInput
}

type DonationLinkCreateInput =
  InferMutationInput<'donationLink.addByUserId'>['data']
type InputCreate = {
  newItemAddress?: DonationLinkCreateInput['address']
  newItemProviderId?: DonationLinkCreateInput['donationProviderId']
}

const formId = 'form-donation-links'

function UserDonationUpdateRow({
  userDonation,
  inputDonationProviderId,
  donationProviders,
  updateOneInput,
  deleteItem,
}: {
  userDonation: UserDonation
  inputDonationProviderId: string | null
  donationProviders: (DonationProviderSelectItem & { logoId: string })[] | null
  updateOneInput: (args: {
    donationLinkId: string
    address?: string
    donationProviderId?: string
  }) => void
  deleteItem: () => void
}) {
  const logoIdFromInput = donationProviders?.find(
    (prov) => prov.donationProviderId === inputDonationProviderId
  )?.logoId

  return (
    <div
      className="grid grid-cols-6 items-center gap-4"
      key={userDonation.donationLinkId}
    >
      <div className="col-span-1">
        <Logo
          topic="donationProviderId"
          logoIdForAccess={logoIdFromInput ?? userDonation.logoId}
        />
      </div>

      <div className="col-span-1">
        <DonationProviderSelect
          onSelect={(selectedProviderId) => {
            updateOneInput({
              donationLinkId: userDonation.donationLinkId,
              donationProviderId: selectedProviderId,
            })
          }}
          donationProviders={donationProviders ?? null}
          initialItem={{
            donationProviderId: userDonation.donationProviderId,
            name: userDonation.donationProviderName,
          }}
        />
      </div>

      <div className="col-span-3">
        <FormInput
          inputId={`${formId}-${userDonation.donationLinkId}-link`}
          placeholder="Link.."
          initialValue={userDonation.donationAddress}
          onChange={(input) =>
            updateOneInput({
              donationLinkId: userDonation.donationLinkId,
              address: input,
            })
          }
          autoFocus={false}
          formId={formId}
        />
      </div>

      <div className="col-span-1">
        <ButtonRemove onClick={deleteItem} />
      </div>
    </div>
  )
}

function UserDonationsUpdates({
  userId,
  userDonations,
}: {
  userId: string
  userDonations: UserDonation[]
}) {
  const { data: donationProviders } = trpc.useQuery(['donationProvider.all'])

  async function invalidate() {
    await utils.invalidateQueries(['donationLink.byUserId', { userId }])
  }

  const utils = trpc.useContext()
  const updateOne = trpc.useMutation('donationLink.edit', {
    async onSuccess() {
      invalidate()
    },
  })
  const deleteOne = trpc.useMutation('donationLink.delete', {
    async onSuccess() {
      invalidate()
    },
  })
  const createOne = trpc.useMutation('donationLink.addByUserId', {
    async onSuccess() {
      invalidate()
    },
  })

  const [inputs, setInputs] = useState<Inputs>()
  const [inputCreate, setInputCreate] = useState<InputCreate>()

  function resetInputs(shouldResetInputCreate: boolean) {
    setInputs(undefined)

    shouldResetInputCreate && setInputCreate(undefined)
  }

  function updateOneInput({
    donationLinkId,
    address,
    donationProviderId,
  }: {
    donationLinkId: string
    address?: string
    donationProviderId?: string
  }) {
    setInputs((prev) => {
      return {
        ...prev,
        [donationLinkId]: {
          address,
          donationProviderId,
        },
      }
    })
  }

  function deleteOneItem(userDonation: UserDonation) {
    deleteOne.mutate({
      donationLinkId: userDonation.donationLinkId,
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (inputs) {
      for (const [donationLinkId, inputNew] of Object.entries(inputs)) {
        const inputData: InferMutationInput<'donationLink.edit'>['data'] = {
          donationProviderId: inputNew.donationProviderId,
          address: inputNew.address,
        }

        await updateOne.mutateAsync({ donationLinkId, data: inputData })
      }
    }

    if (
      inputCreate &&
      inputCreate.newItemAddress &&
      inputCreate.newItemProviderId
    ) {
      await createOne.mutateAsync({
        userId,
        data: {
          address: inputCreate.newItemAddress,
          donationProviderId: inputCreate.newItemProviderId,
        },
      })

      resetInputs(true)
    } else {
      // keep "create" input in case we submitted without the creation (e.g. when provider was missing)
      resetInputs(false)
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="mx-auto mb-10 w-full space-y-4"
    >
      {userDonations.map((userDonation) => (
        <UserDonationUpdateRow
          key={userDonation.donationLinkId}
          userDonation={userDonation}
          inputDonationProviderId={
            inputs?.[userDonation.donationLinkId]?.donationProviderId ?? null
          }
          donationProviders={donationProviders ?? null}
          updateOneInput={updateOneInput}
          deleteItem={() => deleteOneItem(userDonation)}
        />
      ))}

      {/* NEW LINK */}
      <p className="text-center text-xl text-dlila">
        {userDonations.length === 0
          ? 'Add a new link:'
          : '..or add a new link:'}
      </p>

      <div className="grid grid-cols-6 items-center gap-4">
        <div className="col-span-1">
          {inputCreate?.newItemProviderId && (
            <Logo
              topic="donationProviderId"
              logoIdForAccess={inputCreate.newItemProviderId}
            />
          )}
        </div>

        <div className="col-span-1">
          <DonationProviderSelect
            shouldReset={!inputCreate?.newItemProviderId}
            onSelect={(selectedProviderId) => {
              setInputCreate((prev) => ({
                ...prev,
                newItemProviderId: selectedProviderId,
              }))
            }}
            initialItem={undefined}
            donationProviders={donationProviders ?? null}
          />
        </div>

        <div className="col-span-3">
          <FormInput
            placeholder="New link.."
            formId={formId}
            inputId={`${formId}-new-link`}
            initialValue={inputCreate?.newItemAddress ?? undefined}
            onChange={(input) =>
              setInputCreate((prev) => ({ ...prev, newItemAddress: input }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Button
          isSubmit
          disabled={
            !inputs &&
            (!inputCreate?.newItemAddress || !inputCreate?.newItemProviderId)
          }
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
            // resetEditMode()
          }}
        >
          <IconX /> Cancel
        </Button>
      </div>
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
  | { isEditMode?: false; userId?: string }
  | { isEditMode: true; userId: string }
)): JSX.Element {
  return (
    <div className="flex flex-col space-y-4 pl-6 text-left">
      {isEditMode === true ? (
        <UserDonationsUpdates userId={userId} userDonations={userDonations} />
      ) : (
        userDonations.map((userDonation) => (
          <DonationLink
            key={userDonation.donationLinkId}
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
                    <>
                      <p className="mb-4 text-center text-xl text-dlila">
                        Donate via..
                      </p>

                      <UserDonations userDonations={userDonations} />
                    </>
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
