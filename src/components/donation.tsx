import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Popover, Transition } from '@headlessui/react'
import { Fragment, ReactNode } from 'react'
import { useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import {
  schemaCreateDonationLink,
  schemaUpdateDonationLink,
} from '../lib/schemas'
import { trpc } from '../util/trpc'
import { useZodForm } from '../util/use-zod-form'
import { ButtonRemove } from './Button'
import {
  Form,
  FormFieldError,
  FormLabel,
  FormSelect,
  FormSubmit,
  Input,
} from './form'
import { IconArrowDown, IconDonate } from './Icon'
import { LinkExternal } from './link'
import { Logo } from './logo'

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
      <div className="col-span-1 flex justify-end">
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
type SchemaCreateDonationLink = z.infer<typeof schemaCreateDonationLink>

const defaultValuesCreate: SchemaCreateDonationLink = {
  address: '',
  donationProviderId: '',
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
  const createOne = trpc.useMutation('donationLink.createByUserId', {
    async onSuccess() {
      invalidate()
    },
  })
  function deleteOneItem(donationLinkId: string) {
    deleteOne.mutate({
      donationLinkId: donationLinkId,
    })
  }

  const defaultValuesUpdate: SchemaUpdateDonationLink = {
    donationLinksToUpdate: userDonations.map((userDonation) => ({
      donationLinkId: userDonation.donationLinkId,
      address: userDonation.donationAddress,
      donationProviderId: userDonation.donationProviderId,
    })),
  }

  const {
    handleSubmit: handleSubmitUpdate,
    register: registerUpdate,
    control: controlUpdate,
    formState: formStateUpdate,
    reset: resetUpdate,
    watch: watchUpdate,
  } = useZodForm({
    schema: schemaUpdateDonationLink,
    defaultValues: defaultValuesUpdate,
    mode: 'onChange',
  })

  const {
    fields: fieldsUpdate,
    remove: removeUpdate,
    append: appendUpdate,
  } = useFieldArray({
    name: 'donationLinksToUpdate',
    control: controlUpdate,
  })

  const {
    handleSubmit: handleSubmitCreate,
    register: registerCreate,
    control: controlCreate,
    formState: formStateCreate,
    reset: resetCreate,
    watch: watchCreate,
  } = useZodForm({
    schema: schemaCreateDonationLink,
    defaultValues: defaultValuesCreate,
    mode: 'onChange',
  })

  const errorsUpdate = formStateUpdate.errors
  const errorsCreate = formStateCreate.errors
  const dirtyFieldsUpdate = formStateUpdate.dirtyFields

  const newProviderIdFromInput = watchCreate('donationProviderId')

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  return (
    <div>
      <Form
        className="mx-auto mb-10 w-full space-y-4"
        onSubmit={handleSubmitUpdate((data) => {
          /** We only want to submit dirty fields, so we don't have to update all in the DB. */
          const donationLinksDirty = data.donationLinksToUpdate.filter(
            (_, index) => dirtyFieldsUpdate.donationLinksToUpdate?.at(index)
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
          resetUpdate(data)
        })}
      >
        {/* This needs to match whatever is rendered in the form row. */}
        <div className="grid grid-cols-7 place-items-start gap-4">
          <div className="col-span-1"></div>

          <div className="col-span-2">
            <FormLabel>Donation provider</FormLabel>
          </div>

          <div className="col-span-3">
            <FormLabel>Address</FormLabel>
          </div>

          <div className="col-span-1"></div>
        </div>

        <div ref={animateRef} className="w-full space-y-4">
          {fieldsUpdate.map((field, index) => {
            const errorForField =
              errorsUpdate?.donationLinksToUpdate?.at?.(index)?.address
            const userDonation =
              userDonations.find(
                (userDonation) =>
                  userDonation.donationLinkId === field.donationLinkId
              ) ?? null

            /*
             * This case is true when adding a new link (via `append`), as those exist in the field (because we take the response from creation to append),
             * but the `userDonations` have not been fetched yet, so the new link is not available.
             */
            if (!userDonation) return null
            if (!donationProviders)
              return <p key={field.id}>No donation providers available..</p>

            const inputDonationProviderId = watchUpdate(
              'donationLinksToUpdate'
            ).at(index)?.donationProviderId

            return (
              <UserDonationUpdateRow
                key={field.id}
                userDonation={userDonation}
                deleteItem={() => {
                  deleteOneItem(field.donationLinkId)
                  removeUpdate(index)
                }}
                inputDonationProviderId={inputDonationProviderId ?? null}
                donationProviders={donationProviders.map((dP) => ({
                  donationProviderId: dP.donationProviderId,
                  donationProviderName: dP.name,
                  logoId: dP.logoId,
                }))}
                donationProviderSelect={
                  <FormSelect
                    control={controlUpdate}
                    name={
                      `donationLinksToUpdate.${index}.donationProviderId` as const
                    }
                    items={donationProviders.map((provider) => ({
                      itemId: provider.donationProviderId,
                      label: provider.name,
                    }))}
                    unselectedLabel="Please select a provider."
                  />
                }
              >
                <Input
                  {...registerUpdate(
                    `donationLinksToUpdate.${index}.address` as const
                  )}
                  placeholder="Enter an address.."
                  defaultValue={field.address}
                  validationErrorMessage={errorForField?.message}
                />
              </UserDonationUpdateRow>
            )
          })}
        </div>

        <div className="text-center">
          <FormFieldError
            fieldName="donationLinksToUpdate"
            errors={errorsUpdate}
          />
        </div>

        <div className="grid place-items-center">
          <FormSubmit
            isBig={true}
            isInitiallySubmittable={false}
            isValid={formStateUpdate.isValid}
            isDirty={formStateUpdate.isDirty}
            submitCount={formStateUpdate.submitCount}
            isSubmitting={formStateUpdate.isSubmitting}
            isValidating={formStateUpdate.isValidating}
            isLoading={updateMany.isLoading}
          />
        </div>
      </Form>

      {/* NEW LINK */}
      <p className="mb-20 text-center text-xl text-dlila">
        {userDonations.length === 0
          ? 'Add a new link:'
          : '..or add a new link:'}
      </p>

      <Form
        onSubmit={handleSubmitCreate((data) => {
          createOne.mutate(
            { newDonationLink: data },
            {
              onSuccess: async (createdDonationLink) => {
                const { donationLinkId, address, donationProvider } =
                  createdDonationLink
                /**
                 * After creation, we append the link to the existing links. Here, we take the default values of the links
                 * as a baseline type and require all fields.
                 */
                const createdTransformed: Required<
                  typeof defaultValuesUpdate['donationLinksToUpdate'][number]
                > = {
                  donationLinkId,
                  address,
                  donationProviderId: donationProvider.donationProviderId,
                }
                appendUpdate(createdTransformed)

                // reset default values - see other `reset` comment
                resetCreate(defaultValuesCreate)
              },
            }
          )
        })}
      >
        <div className="grid grid-cols-7 items-center gap-4">
          <div className="col-span-1 flex justify-end">
            {newProviderIdFromInput && (
              <Logo
                topic="donationProviderId"
                logoIdForAccess={newProviderIdFromInput}
              />
            )}
          </div>

          <div className="col-span-2">
            {!donationProviders ? (
              <p>No donation providers available..</p>
            ) : (
              <FormSelect
                // we throw away the component after a successful submit to reset the selection
                key={formStateCreate.isSubmitSuccessful + ''}
                control={controlCreate}
                name="donationProviderId"
                items={donationProviders.map((provider) => ({
                  itemId: provider.donationProviderId,
                  label: provider.name,
                }))}
                unselectedLabel="Please select a provider."
                validationErrorMessage={
                  errorsCreate.donationProviderId?.message
                }
              />
            )}
          </div>

          <div className="col-span-3">
            <Input
              {...registerCreate('address')}
              placeholder="Enter an address.."
              defaultValue=""
              validationErrorMessage={errorsCreate.address?.message}
            />
          </div>

          <div className="col-span-1">
            <FormSubmit
              isValid={formStateCreate.isValid}
              isDirty={formStateCreate.isDirty}
              submitCount={formStateCreate.submitCount}
              isSubmitting={formStateCreate.isSubmitting}
              isValidating={formStateCreate.isValidating}
              isLoading={updateMany.isLoading}
            >
              Add
            </FormSubmit>
          </div>
        </div>

        <div className="mt-10">
          <FormFieldError
            fieldName="general-form-error-key"
            errors={errorsCreate}
          />
        </div>
      </Form>
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
            <Popover.Panel className="absolute left-1/2 z-20 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-xl">
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
