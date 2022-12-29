import { Disclosure, Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import { useFormState } from 'react-hook-form'
import { z } from 'zod'
import { FormDefaultValuesUndefinable, schemaCreatePost } from '../lib/schemas'
import { useAuth } from '../services/auth-service'
import { ROUTES } from '../services/routing'
import { trpc } from '../util/trpc'
import { useRouteChange } from '../util/use-route-change'
import { useZodForm } from '../util/use-zod-form'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Form, FormFieldError, FormSelect, FormSubmit, Input } from './form'
import {
  IconBell,
  IconEdit,
  IconHome,
  IconMenu,
  IconSignIn,
  IconSignOut,
  IconUser,
  IconX,
} from './Icon'
import { Link } from './link'
import { LoadingAnimation } from './LoadingAnimation'
import { Modal, useModal } from './modal'
import { NoContent } from './NoContent'

const NAV_ROUTES = [
  {
    name: 'Home',
    href: ROUTES.home,
    icon: (
      <IconHome size="big" className="text-dsecondary group-hover:text-white" />
    ),
  },
  { name: 'Explore', href: ROUTES.explore, icon: null },
] as const

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ')
}

function UserNavbarInternal({ userId }: { userId: string }) {
  const {
    data: user,
    isLoading,
    isError,
  } = trpc.user.byUserId.useQuery(
    { userId },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      keepPreviousData: true,
    }
  )

  return (
    <Menu.Button className="flex rounded-full text-sm hover:bg-dsecondary hover:text-white focus:outline-none focus:ring-2 focus:ring-dlight">
      <div className="flex flex-row items-center font-semibold">
        {isLoading ? (
          <LoadingAnimation />
        ) : isError || !user ? (
          <p>Error loading user.</p>
        ) : (
          <>
            <p className="hidden px-2 sm:block">{user.username}</p>
            <div className="flex items-center sm:ml-2">
              <Avatar
                userId={userId}
                username={user.username ?? ''}
                imageId={user.imageId ?? null}
                imageBlurDataURL={user.imageBlurDataURL ?? null}
                size="small"
                placeholderColorVariant="orange"
              />
            </div>
          </>
        )}
      </div>
    </Menu.Button>
  )
}

function UserNavbar() {
  const { userIdAuth, isLoadingAuth, signOut } = useAuth()

  return (
    <Menu as="div" className="relative">
      <div className="grid place-items-end md:min-w-[150px]">
        {isLoadingAuth ? (
          <LoadingAnimation />
        ) : !userIdAuth ? (
          <Link to={ROUTES.signIn}>
            {/* TODO Should be a ButtonNav */}
            <Button icon={<IconSignIn />} onClick={() => console.info('')}>
              Sign in
            </Button>
          </Link>
        ) : (
          <UserNavbarInternal userId={userIdAuth} />
        )}
      </div>

      <Transition
        as="div"
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        {userIdAuth && (
          <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white py-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none lg:w-60">
            <Link to={ROUTES.user(userIdAuth)}>
              <Menu.Item>
                {({ active }) => (
                  <p
                    className={classNames(
                      active && 'bg-dsecondary hover:text-white',
                      'group block px-4 py-2 text-sm'
                    )}
                  >
                    <IconUser className="text-dsecondary group-hover:text-white" />
                    <span className="ml-1">Your profile</span>
                  </p>
                )}
              </Menu.Item>
            </Link>
            <Menu.Item>
              <div className="mt-4 grid place-items-center">
                <Button icon={<IconSignOut />} onClick={signOut}>
                  Sign out
                </Button>
              </div>
            </Menu.Item>
          </Menu.Items>
        )}
      </Transition>
    </Menu>
  )
}

export function Header(): JSX.Element {
  const isLoading = useRouteChange()
  const { asPath } = useRouter()

  return (
    <Disclosure
      as="nav"
      className="fixed top-0 z-30 w-full border-b border-gray-100 bg-opacity-30 text-dprimary backdrop-blur-2xl"
    >
      {({ open }) => (
        <>
          <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* MOBILE menu button*/}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-dprimary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-dlight">
                  <span className="sr-only">Open main menu</span>
                  {open ? <IconX size="big" /> : <IconMenu size="big" />}
                </Disclosure.Button>
              </div>

              {/* Navbar content */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center">
                  <Link to={ROUTES.home}>
                    <div className="text-left text-4xl font-extrabold leading-none tracking-tight">
                      <p className="bg-gradient-to-b from-dsecondary to-orange-300 decoration-clone bg-clip-text text-3xl uppercase text-transparent">
                        Condun
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Navbar nav items */}
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {NAV_ROUTES.map((route) => (
                      <Link key={route.name} to={route.href}>
                        <span
                          className={classNames(
                            route.href === asPath && route.href !== '/'
                              ? 'border-b border-b-dprimary text-dprimary'
                              : 'hover:rounded-md hover:bg-dsecondary hover:text-white',
                            'group px-3 py-2.5 text-sm font-semibold'
                          )}
                          aria-current={
                            route.href === asPath ? 'page' : undefined
                          }
                        >
                          {route.icon ?? route.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navbar right side */}
              <div className="absolute inset-y-0 right-0 flex items-center space-x-3 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isLoading && <LoadingAnimation />}

                <div className="hidden sm:block">
                  <CreatePostModal />
                </div>

                <button
                  type="button"
                  className="group rounded-full p-1 hover:bg-dsecondary focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="sr-only">View notifications</span>
                  <IconBell className="text-dsecondary group-hover:text-white" />
                </button>

                <UserNavbar />
              </div>
            </div>
          </div>

          {/* MOBILE navbar items */}
          <Transition
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Disclosure.Panel className="sm:hidden">
              <div className="grid place-items-center">
                <CreatePostModal />
              </div>

              <div className="space-y-2 px-2 pt-2 pb-3">
                {NAV_ROUTES.map((route) => (
                  <div key={route.name}>
                    <Link to={route.href}>
                      <Disclosure.Button
                        as="div"
                        className={classNames(
                          route.href === asPath
                            ? 'rounded-md bg-dsecondary text-white'
                            : 'hover:rounded-md hover:bg-dprimary hover:text-white',
                          'block px-3 py-2 text-base font-semibold'
                        )}
                        aria-current={
                          route.href === asPath ? 'page' : undefined
                        }
                      >
                        {route.name}
                      </Disclosure.Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}

type SchemaCreatePost = z.infer<typeof schemaCreatePost>

const defaultValuesCreate: FormDefaultValuesUndefinable<
  SchemaCreatePost,
  'categoryId'
> = { title: '', categoryId: undefined }

function CreatePostModal() {
  const { isOpen, open, close } = useModal()
  const router = useRouter()

  const createPost = trpc.posts.create.useMutation()

  const { handleSubmit, register, reset, control } = useZodForm({
    schema: schemaCreatePost,
    defaultValues: defaultValuesCreate,
    mode: 'onSubmit',
  })
  const { errors } = useFormState({ control })

  const { data: postCategories, isLoading: isLoadingCategories } =
    trpc.postCategories.all.useQuery()

  return (
    <>
      <Button onClick={open} icon={<IconEdit />}>
        Create Post
      </Button>

      <Modal
        isOpen={isOpen}
        close={close}
        title="Create a post"
        forceHalfWidth
        onConfirm={async () => console.log('Confirmed')}
        isSubmit={true}
      >
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Give your post a title, subtitle and category to start with!
          </p>
        </div>

        <div className="mx-auto mt-10 mb-10 w-full">
          <Form
            onSubmit={handleSubmit((data) => {
              createPost.mutate(
                {
                  title: data.title,
                  subtitle: data.subtitle,
                  categoryId: data.categoryId,
                },
                {
                  onSuccess: async (result) => {
                    close()
                    reset()
                    await router.push(ROUTES.post(result.id))
                  },
                }
              )
            })}
            className="my-4 flex w-full flex-col space-y-16 px-6 md:px-20"
          >
            <Input
              {...register('title')}
              placeholder="Enter a title.."
              validationErrorMessage={errors.title?.message}
              isSpecial
              small
            />
            <Input
              {...register('subtitle')}
              placeholder="Enter a subtitle.."
              validationErrorMessage={errors.subtitle?.message}
              isSpecial
              small
            />

            {isLoadingCategories ? (
              <LoadingAnimation />
            ) : !postCategories ? (
              <NoContent>No categories</NoContent>
            ) : (
              <>
                <FormSelect
                  control={control}
                  name="categoryId"
                  items={postCategories.map((category) => ({
                    itemId: category.id,
                    label: category.name,
                  }))}
                  validationErrorMessage={errors.categoryId?.message}
                  unselectedLabel="Please select a category."
                />
                <FormFieldError
                  fieldName="general-form-error-key"
                  errors={errors}
                />
              </>
            )}

            <div className="mx-auto">
              <FormSubmit
                isBig={true}
                isInitiallySubmittable={true}
                control={control}
                isLoading={createPost.isLoading}
              >
                Create
              </FormSubmit>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  )
}
