import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Popover, Transition } from '@headlessui/react'
import type { DonationProviderId } from '@prisma/client'
import { Fragment, ReactNode, useMemo } from 'react'
import { useFieldArray, useFormState } from 'react-hook-form'
import { z } from 'zod'
import {
  FormDefaultValuesUndefinable,
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
import { LoadingAnimation } from './LoadingAnimation'
import { Logo } from './logo'
import { NoContent } from './NoContent'

function DonationLink({
  userDonation,
}: {
  userDonation: UserDonation
}): JSX.Element {
  return (
    <LinkExternal to={userDonation.donationAddress}>
      <div className="flex-1 rounded-lg p-2 hover:bg-dtertiary hover:text-white">
        <div className="flex">
          <div className="grid w-1/2 place-items-center">
            <Logo
              topic="donationProviderId"
              logoIdForAccess={userDonation.donationProviderId}
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
  donationProviderId: DonationProviderId
  donationProviderName: string
  donationAddress: string
}

function UserDonationUpdateRow({
  userDonation,
  inputDonationProviderId,
  donationProviders,
  deleteItem,
  donationProviderSelect,
  children,
}: {
  userDonation: UserDonation
  inputDonationProviderId: DonationProviderId | null
  donationProviders: {
    donationProviderId: DonationProviderId
    donationProviderName: string
  }[]
  deleteItem: () => void
  donationProviderSelect: ReactNode
  children: ReactNode
}): JSX.Element {
  const logoIdFromInput = donationProviders.find(
    (prov) => prov.donationProviderId === inputDonationProviderId
  )?.donationProviderId

  if (!userDonation)
    return (
      <div>
        <NoContent>No user donation available.</NoContent>
      </div>
    )

  return (
    <div
      className="grid grid-cols-7 items-center gap-4 border-b-2 pb-4 lg:border-b-0 lg:pb-0"
      key={userDonation.donationLinkId}
    >
      <div className="col-span-full lg:hidden">
        <FormLabel>Donation provider</FormLabel>
      </div>

      <div className="col-span-1 flex justify-end">
        <Logo
          topic="donationProviderId"
          logoIdForAccess={logoIdFromInput ?? userDonation.donationProviderId}
        />
      </div>

      <div className="col-span-6 lg:col-span-2">{donationProviderSelect}</div>

      <div className="col-span-4 lg:col-span-3">
        <span className="inline lg:hidden">
          <FormLabel>Address</FormLabel>
        </span>
        {children}
      </div>

      <div className="col-span-3 flex h-full items-end justify-end lg:col-span-1">
        <ButtonRemove onClick={deleteItem} />
      </div>
    </div>
  )
}

type SchemaUpdateDonationLink = z.infer<typeof schemaUpdateDonationLink>
type SchemaCreateDonationLink = z.infer<typeof schemaCreateDonationLink>

const defaultValuesCreate: FormDefaultValuesUndefinable<
  SchemaCreateDonationLink,
  'donationProviderId'
> = { address: '', donationProviderId: undefined }

function UserDonationsUpdates({
  userId,
  userDonations,
}: {
  userId: string
  userDonations: UserDonation[]
}) {
  const { data: donationProviders } = trpc.donationProvider.all.useQuery()

  const utils = trpc.useContext()

  async function invalidate() {
    await utils.donationLink.byUserId.invalidate({ userId })
  }

  const updateMany = trpc.donationLink.editMany.useMutation({
    onSuccess: invalidate,
  })
  const deleteOne = trpc.donationLink.delete.useMutation({
    onSuccess: invalidate,
  })
  const createOne = trpc.donationLink.createByUserId.useMutation({
    onSuccess: invalidate,
  })

  function deleteOneItem(donationLinkId: string) {
    deleteOne.mutate({
      donationLinkId: donationLinkId,
    })
  }

  const defaultValuesUpdate: SchemaUpdateDonationLink = useMemo(
    () => ({
      donationLinksToUpdate: userDonations.map((userDonation) => ({
        donationLinkId: userDonation.donationLinkId,
        address: userDonation.donationAddress,
        donationProviderId: userDonation.donationProviderId,
      })),
    }),
    [userDonations]
  )

  const {
    handleSubmit: handleSubmitUpdate,
    register: registerUpdate,
    control: controlUpdate,
    watch: watchUpdate,
  } = useZodForm({
    schema: schemaUpdateDonationLink,
    defaultValues: defaultValuesUpdate,
    mode: 'onSubmit',
  })
  const { errors: errorsUpdate, dirtyFields: dirtyFieldsUpdate } = useFormState(
    { control: controlUpdate }
  )

  const { fields: fieldsUpdate, remove: removeUpdate } = useFieldArray({
    name: 'donationLinksToUpdate',
    control: controlUpdate,
  })

  const {
    handleSubmit: handleSubmitCreate,
    register: registerCreate,
    control: controlCreate,
    reset: resetCreate,
    watch: watchCreate,
  } = useZodForm({
    schema: schemaCreateDonationLink,
    defaultValues: defaultValuesCreate,
    mode: 'onSubmit',
  })
  const { errors: errorsCreate, isSubmitSuccessful } = useFormState({
    control: controlCreate,
  })

  const newProviderIdFromInput = watchCreate('donationProviderId')

  const [animateRef] = useAutoAnimate<HTMLDivElement>()

  return (
    <div>
      {userDonations.length > 0 && (
        <Form
          className="mx-auto mb-4 w-full space-y-4 lg:mb-10"
          onSubmit={handleSubmitUpdate((data) => {
            /** We only want to submit dirty fields, so we don't have to update all in the DB. */
            const donationLinksDirty = data.donationLinksToUpdate.filter(
              (_, index) => dirtyFieldsUpdate.donationLinksToUpdate?.at(index)
            )

            updateMany.mutate({
              donationLinksToUpdate: donationLinksDirty,
            })
          })}
        >
          {/* This needs to match whatever is rendered in the form row. */}
          <div className="hidden grid-cols-7 items-center gap-4 border-b-2 pb-4 lg:grid lg:border-b-0 lg:pb-0">
            <div className="col-span-1 flex justify-end"></div>

            <div className="col-span-6 lg:col-span-2">
              <FormLabel>Donation provider</FormLabel>
            </div>

            <div className="col-span-4 lg:col-span-3">
              <FormLabel>Address</FormLabel>
            </div>

            <div className="col-span-3 flex justify-end lg:col-span-1"></div>
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
                return (
                  <NoContent key={field.id}>
                    No donation providers available.
                  </NoContent>
                )

              const inputDonationProviderId = watchUpdate(
                'donationLinksToUpdate'
              ).at(index)?.donationProviderId

              return (
                <UserDonationUpdateRow
                  key={field.id}
                  userDonation={userDonation}
                  deleteItem={() => {
                    removeUpdate(index)
                    deleteOneItem(field.donationLinkId)
                  }}
                  inputDonationProviderId={inputDonationProviderId ?? null}
                  donationProviders={donationProviders.map((dP) => ({
                    donationProviderId: dP.donationProviderId,
                    donationProviderName: dP.name,
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
                      validationErrorMessage={
                        errorsUpdate.donationLinksToUpdate?.message
                      }
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
              isLoading={updateMany.isLoading}
              control={controlUpdate}
            />
          </div>
        </Form>
      )}

      {/* NEW LINK */}
      <p className="mb-20 text-center text-xl text-dprimary">
        {userDonations.length === 0
          ? 'Add a new link:'
          : '..or add a new link:'}
      </p>

      <Form
        onSubmit={handleSubmitCreate((data) => {
          createOne.mutate(
            { newDonationLink: data },
            {
              onSuccess: () => resetCreate(),
            }
          )
        })}
      >
        <div className="grid grid-cols-7 items-center gap-4 border-b-2 pb-4 lg:border-b-0 lg:pb-0">
          <div className="col-span-full lg:hidden">
            <FormLabel>Donation provider</FormLabel>
          </div>

          <div className="col-span-1 flex justify-end">
            {newProviderIdFromInput && (
              <Logo
                topic="donationProviderId"
                logoIdForAccess={newProviderIdFromInput}
              />
            )}
          </div>

          <div className="col-span-6 lg:col-span-2">
            {!donationProviders ? (
              <NoContent>No donation providers available.</NoContent>
            ) : (
              <FormSelect
                // we throw away the component after a successful submit to reset the selection
                key={isSubmitSuccessful + ''}
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

          <div className="col-span-4 lg:col-span-3">
            <span className="inline lg:hidden">
              <FormLabel>Address</FormLabel>
            </span>
            <Input
              {...registerCreate('address')}
              placeholder="Enter an address.."
              defaultValue=""
              validationErrorMessage={errorsCreate.address?.message}
            />
          </div>

          <div className="col-span-3 flex h-full items-end justify-end lg:col-span-1">
            <FormSubmit
              isInitiallySubmittable={true}
              isLoading={updateMany.isLoading}
              control={controlCreate}
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
      ) : userDonations.length === 0 ? (
        <NoContent>This user has not provided any donation links.</NoContent>
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

export function DonateButton({ userId }: { userId: string }): JSX.Element {
  const { data: donationLinks, isLoading } =
    trpc.donationLink.byUserId.useQuery({ userId })

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            className={`
                  ${open ? '' : 'text-opacity-90'}
                  font-medium group inline-flex items-center rounded-md bg-dsecondary px-3 py-2 text-base text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
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
                  {isLoading ? (
                    <div className="grid place-items-center">
                      <LoadingAnimation />
                    </div>
                  ) : !!donationLinks && donationLinks.length > 0 ? (
                    <>
                      <p className="mb-4 text-center text-xl text-dprimary">
                        Donate via..
                      </p>

                      <UserDonations
                        userDonations={donationLinks.map((dL) => ({
                          donationLinkId: dL.donationLinkId,
                          donationAddress: dL.address,
                          donationProviderId:
                            dL.donationProvider.donationProviderId,
                          donationProviderName: dL.donationProvider.name,
                        }))}
                      />
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
