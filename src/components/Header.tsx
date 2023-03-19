import { Disclosure, Menu, Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Fragment, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { schemaPostSearch } from '../lib/schemas'
import { useAuth } from '../services/auth-service'
import { createRouteWithSearchParam } from '../services/router-service'
import { ROUTES } from '../services/routing'
import { trpc } from '../util/trpc'
import { useOnClickOutside } from '../util/use-on-click-outside'
import { useRouteChange } from '../util/use-route-change'
import { useZodForm } from '../util/use-zod-form'
import { AuthenticateButton } from './AuthenticateButton'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Form, Input, useIsSubmitEnabled } from './form'
import {
  IconHome,
  IconMenu,
  IconNotification,
  IconSearch,
  IconSignOut,
  IconUser,
  IconX,
} from './Icon'
import { Link } from './link'
import { LoadingAnimation } from './LoadingAnimation'

const DynamicCreatePostModal = dynamic(
  () => import('./CreatePostModal').then((mod) => mod.CreatePostModal),
  { ssr: false }
)

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
                username={user.username}
                imageId={user.imageId}
                imageBlurDataURL={user.imageBlurDataURL}
                imageFileExtension={user.imageFileExtension}
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
          <AuthenticateButton />
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

type SchemaPostSearch = z.infer<typeof schemaPostSearch>

function SearchInputIcon({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <span onClick={onClick}>
      <IconSearch size="big" className="cursor-pointer text-dprimary" />
    </span>
  )
}

function SearchInput(): JSX.Element {
  const router = useRouter()
  const defaultValuesPostSearch: SchemaPostSearch = useMemo(
    () => ({
      searchInput: '',
      includeTitle: true,
      includeSubtitle: true,
      includeSegmentsTitle: true,
      includeSegmentsSubtitle: true,
      tagIdsToFilter: [],
      categoryIdsToFilter: [],
    }),
    []
  )
  const {
    handleSubmit: handleSubmitPostSearch,
    register: registerPostSearch,
    reset,
    control,
    getValues,
    formState: {
      errors: { searchInput: errorSearchInput },
    },
  } = useZodForm({
    schema: schemaPostSearch,
    defaultValues: defaultValuesPostSearch,
    mode: 'onSubmit',
  })

  const popoverSearchRef = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(popoverSearchRef, () =>
    setIsPopoverSearchInputActive(false)
  )

  function handleSearch(searchInput: string) {
    reset()
    setIsPopoverSearchInputActive(false)
    router.push(
      createRouteWithSearchParam({
        route: ROUTES.search,
        searchParamKey: 's',
        value: searchInput,
      })
    )
  }

  const isSubmitEnabled = useIsSubmitEnabled({
    control,
    isLoading: false,
  })

  function handleProgrammaticSubmit() {
    if (isSubmitEnabled) {
      handleSearch(getValues('searchInput'))
    }
  }

  const [isPopoverSearchInputActive, setIsPopoverSearchInputActive] =
    useState(false)

  const FormElement = (
    <Form
      onSubmit={handleSubmitPostSearch((formData) => {
        handleSearch(formData.searchInput)
      })}
    >
      <Input
        {...registerPostSearch('searchInput')}
        placeholder="What are you looking for?"
        isSpecial
        small
        validationErrorMessage={errorSearchInput?.message}
        icon={<SearchInputIcon onClick={handleProgrammaticSubmit} />}
        textAlignCenter={true}
        hideBottomBorderForSpecial={true}
      />
    </Form>
  )

  return (
    <div className="inline">
      <span
        className="block cursor-pointer lg:hidden"
        onClick={() => setIsPopoverSearchInputActive(true)}
      >
        <SearchInputIcon onClick={handleProgrammaticSubmit} />
      </span>

      <div
        ref={popoverSearchRef}
        className="fixed left-0 top-20 block w-screen lg:hidden"
      >
        <Transition
          show={isPopoverSearchInputActive}
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-500"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="px-4">
            <div className="w-full overflow-hidden rounded-lg bg-white px-4 shadow-lg ring-1 ring-black ring-opacity-5">
              {isPopoverSearchInputActive && FormElement}
            </div>
          </div>
        </Transition>
      </div>

      <div className="hidden lg:block">
        {!isPopoverSearchInputActive && FormElement}
      </div>
    </div>
  )
}

export function Header(): JSX.Element {
  const isLoading = useRouteChange()
  const { asPath } = useRouter()
  const { userIdAuth } = useAuth()

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
              <div className="relative flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <span className="absolute left-14 inline sm:hidden">
                  <SearchInput />
                </span>

                <div className="absolute flex shrink-0 items-center sm:static">
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
                <div className="hidden sm:block">
                  <SearchInput />
                </div>
                <span className="inline-grid w-3 place-items-end sm:w-16 sm:place-items-center">
                  <span className="inline sm:hidden">
                    {isLoading && <LoadingAnimation size="small" />}
                  </span>
                  <span className="hidden sm:inline">
                    {isLoading && <LoadingAnimation />}
                  </span>
                </span>
                <div className="hidden sm:block">
                  <DynamicCreatePostModal />
                </div>
                {!!userIdAuth && (
                  <button
                    type="button"
                    className="group rounded-full p-1 hover:bg-dsecondary focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="sr-only">View notifications</span>
                    <IconNotification className="text-dsecondary group-hover:text-white" />
                  </button>
                )}

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
                <DynamicCreatePostModal />
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
