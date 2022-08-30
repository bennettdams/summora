import { Popover, Transition } from '@headlessui/react'
import { Fragment, ReactNode } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { schemaUpdateDonationLink } from '../lib/schemas'
import { trpc } from '../util/trpc'
import { useZodForm } from '../util/use-zod-form'
import { ButtonRemove } from './Button'
import { DropdownSelect } from './DropdownSelect'
import { Form, FormLabel, FormSubmit, Input } from './form'
import { IconDonate, IconArrowDown } from './Icon'
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

type UserDonation = {
  donationLinkId: string
  donationProviderId: string
  logoId: string
  donationProviderName: string
  donationAddress: string
}

// type DonationLinkInput = InferMutationInput<'donationLink.edit'>['data']
// type Inputs = {
//   [donationLinkId: string]: DonationLinkInput
// }

// type DonationLinkCreateInput =
//   InferMutationInput<'donationLink.addByUserId'>['data']
// type InputCreate = {
//   newItemAddress?: DonationLinkCreateInput['address']
//   newItemProviderId?: DonationLinkCreateInput['donationProviderId']
// }

// function UserDonationUpdateRow({
// userDonation,
// inputDonationProviderId,
// donationProviders,
//   updateOneInput,
//   deleteItem,
// }: {
// userDonation: UserDonation
// inputDonationProviderId: string | null
// donationProviders: (DonationProviderSelectItem & { logoId: string })[] | null
//   updateOneInput: (args: {
//     donationLinkId: string
//     address?: string
//     donationProviderId?: string
//   }) => void
//   deleteItem: () => void
// }) {
// const logoIdFromInput = donationProviders?.find(
//   (prov) => prov.donationProviderId === inputDonationProviderId
// )?.logoId

//   return (
// <div
//   className="grid grid-cols-6 items-center gap-4"
//   key={userDonation.donationLinkId}
// >
//   <div className="col-span-1">
//     <DonationProviderSelect
//       onSelect={(selectedProviderId) => {
//         updateOneInput({
//           donationLinkId: userDonation.donationLinkId,
//           donationProviderId: selectedProviderId,
//         })
//       }}
//       donationProviders={donationProviders ?? null}
//       initialItem={{
//         donationProviderId: userDonation.donationProviderId,
//         name: userDonation.donationProviderName,
//       }}
//     />
//   </div>
// </div>
//   )
// }

function UserDonationUpdateRow({
  userDonation,
  inputDonationProviderId,
  donationProviders,
  deleteItem,
  donationProviderSelect,
  children,
}: {
  userDonation: UserDonation
  inputDonationProviderId: string | null
  donationProviders: {
    logoId: string
    donationProviderId: string
    donationProviderName: string
  }[]
  deleteItem: () => void
  donationProviderSelect: ReactNode
  children: ReactNode
}): JSX.Element {
  const logoIdFromInput = donationProviders.find(
    (prov) => prov.donationProviderId === inputDonationProviderId
  )?.logoId

  if (!userDonation) return <div>No user donation available..</div>

  return (
    <div
      className="grid grid-cols-7 items-center gap-4"
      key={userDonation.donationLinkId}
    >
      <div className="col-span-1">
        <Logo
          topic="donationProviderId"
          logoIdForAccess={logoIdFromInput ?? userDonation.logoId}
        />
      </div>

      <div className="col-span-2">{donationProviderSelect}</div>

      <div className="col-span-3">{children}</div>

      <div className="col-span-1">
        <ButtonRemove onClick={deleteItem} />
      </div>
    </div>
  )
}

type SchemaUpdateDonationLink = z.infer<typeof schemaUpdateDonationLink>

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
  const updateMany = trpc.useMutation('donationLink.editMany', {
    async onSuccess() {
      invalidate()
    },
  })
  const deleteOne = trpc.useMutation('donationLink.delete', {
    async onSuccess() {
      invalidate()
    },
  })
  // const createOne = trpc.useMutation('donationLink.addByUserId', {
  //   async onSuccess() {
  //     invalidate()
  //   },
  // })

  function deleteOneItem(donationLinkId: string) {
    deleteOne.mutate({
      donationLinkId: donationLinkId,
    })
  }

  // async function handleSubmit(e: FormEvent) {
  //   e.preventDefault()

  //   if (inputs) {
  //     for (const [donationLinkId, inputNew] of Object.entries(inputs)) {
  //       const inputData: InferMutationInput<'donationLink.edit'>['data'] = {
  //         donationProviderId: inputNew.donationProviderId,
  //         address: inputNew.address,
  //       }

  //       await updateOne.mutateAsync({ donationLinkId, data: inputData })
  //     }
  //   }

  //   if (
  //     inputCreate &&
  //     inputCreate.newItemAddress &&
  //     inputCreate.newItemProviderId
  //   ) {
  //     await createOne.mutateAsync({
  //       userId,
  //       data: {
  //         address: inputCreate.newItemAddress,
  //         donationProviderId: inputCreate.newItemProviderId,
  //       },
  //     })

  //     resetInputs(true)
  //   } else {
  //     // keep "create" input in case we submitted without the creation (e.g. when provider was missing)
  //     resetInputs(false)
  //   }
  // }

  const defaultValuesInitial: SchemaUpdateDonationLink = {
    donationLinksToUpdate: userDonations.map((userDonation) => ({
      donationLinkId: userDonation.donationLinkId,
      address: userDonation.donationAddress,
      donationProviderId: userDonation.donationProviderId,
    })),
  }

  const { handleSubmit, register, control, formState, reset, watch } =
    useZodForm({
      schema: schemaUpdateDonationLink,
      defaultValues: defaultValuesInitial,
      mode: 'onChange',
    })

  // const { fields, append, remove } = useFieldArray({
  const { fields, remove } = useFieldArray({
    name: 'donationLinksToUpdate',
    control,
  })

  const errors = formState.errors
  const dirtyFields = formState.dirtyFields

  return (
    <div>
      <Form
        className="mx-auto mb-10 w-full space-y-4"
        onSubmit={handleSubmit((data) => {
          /** We only want to submit dirty fields, so we don't have to update all in the DB. */
          const donationLinksDirty = data.donationLinksToUpdate.filter(
            (_, index) => dirtyFields.donationLinksToUpdate?.at(index)
          )

          updateMany.mutate({
            donationLinksToUpdate: donationLinksDirty,
          })

          /*
           * Reset the default values to our new data.
           * This is done to "set" the validation to the newly
           * updated values.
           * See: https://react-hook-form.com/api/useform/reset
           */
          reset(data)
        })}
      >
        {/* this needs to match whatever is rendered in the form row */}
        <div className="grid grid-cols-7 items-center gap-4">
          <div className="col-span-1"></div>

          <div className="col-span-2">
            <FormLabel>Donation provider</FormLabel>
          </div>

          <div className="col-span-3">
            <FormLabel>Address</FormLabel>
          </div>

          <div className="col-span-1"></div>
        </div>

        {fields.map((field, index) => {
          const errorForField = errors?.donationLinksToUpdate?.[index]?.address
          const userDonation =
            userDonations.find(
              (userDonation) =>
                userDonation.donationLinkId === field.donationLinkId
            ) ?? null

          if (!userDonation) return <p>No donation link available..</p>
          if (!donationProviders)
            return <p>No donation providers available..</p>

          const inputDonationProviderId = watch('donationLinksToUpdate').at(
            index
          )?.donationProviderId

          return (
            <UserDonationUpdateRow
              key={field.id}
              userDonation={userDonation}
              deleteItem={() => {
                deleteOneItem(field.donationLinkId)
                remove(index)
              }}
              inputDonationProviderId={inputDonationProviderId ?? null}
              donationProviders={donationProviders.map((dP) => ({
                donationProviderId: dP.donationProviderId,
                donationProviderName: dP.name,
                logoId: dP.logoId,
              }))}
              donationProviderSelect={
                <Controller
                  // if this does not work, we could also use register(..), which returns e.g. `name`
                  name={
                    `donationLinksToUpdate.${index}.donationProviderId` as const
                  }
                  control={control}
                  render={({ field: fieldSelection }) => (
                    <DropdownSelect
                      unselectedLabel="Please select a provider."
                      selectedItemIdExternal={fieldSelection.value ?? null}
                      items={donationProviders.map((provider) => ({
                        itemId: provider.donationProviderId,
                        label: provider.name,
                      }))}
                      onChangeSelection={(selectedItemId) => {
                        fieldSelection.onChange(selectedItemId)
                      }}
                    />
                  )}
                />
              }
            >
              <Input
                {...register(
                  `donationLinksToUpdate.${index}.address` as const,
                  {
                    required: true,
                  }
                )}
                placeholder="Enter an address.."
                defaultValue={field.address}
                validationErrorMessage={errorForField?.message}
              />
            </UserDonationUpdateRow>
          )
        })}

        <button
          type="button"
          className="mx-auto block bg-blue-300 p-4"
          onClick={() =>
            // append({
            //   postId: 'new',
            //   text: '',
            // })
            console.log('§app')
          }
        >
          Append
        </button>

        <FormSubmit
          isValid={formState.isValid}
          isSubmitted={formState.isSubmitted}
          isSubmitting={formState.isSubmitting}
          isValidating={formState.isValidating}
          isLoading={updateMany.isLoading}
        />

        <div>RESET</div>
      </Form>

      <div>NEW Link</div>

      {/* NEW LINK */}
      <p className="text-center text-xl text-dlila">
        {userDonations.length === 0
          ? 'Add a new link:'
          : '..or add a new link:'}
      </p>

      {/* <form
        id={formId}
        onSubmit={handleSubmit}
        className="mx-auto mb-10 w-full space-y-4"
      >
        NEW LINK
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

      </form> */}
    </div>
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
