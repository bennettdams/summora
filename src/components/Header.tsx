import { Disclosure, Menu, Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  Fragment,
  ReactNode,
  cloneElement,
  isValidElement,
  useMemo,
  useRef,
  useState,
} from 'react'
import { z } from 'zod'
import img from '../../public/assets/summora-logo.png'
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
import {
  IconExplore,
  IconHome,
  IconMenu,
  IconNotification,
  IconProps,
  IconSearch,
  IconSignOut,
  IconSize,
  IconUser,
  IconX,
} from './Icon'
import { LoadingAnimation } from './LoadingAnimation'
import { Form, Input, useIsSubmitEnabled } from './form'
import { Link } from './link'

const DynamicCreatePostModal = dynamic(
  () => import('./CreatePostModal').then((mod) => mod.CreatePostModal),
  { ssr: false }
)

const NAV_ROUTES = [
  {
    name: 'Home',
    href: ROUTES.home,
    icon: <IconHome />,
    iconSize: 'big',
    hideNameOnLargeScreen: true,
  },

  {
    name: 'Explore',
    href: ROUTES.explore,
    icon: <IconExplore />,
    iconSize: 'medium',
    hideNameOnLargeScreen: false,
  },
] as const satisfies readonly {
  name: string
  href: string
  icon: ReactNode
  hideNameOnLargeScreen: boolean
  iconSize: IconSize
}[]

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
    <Menu.Button className="flex rounded-full text-sm transition duration-200 hover:bg-dsecondary hover:text-white focus:outline-none focus:ring-2 focus:ring-dlight">
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

  return (
    <div className="inline">
      <span
        className="flex cursor-pointer flex-row items-center"
        // TODO Clicking on the search icon should hide the bar again, but right now this is prevented from the "outside click" implementation, which interfers here.
        onClick={() => setIsPopoverSearchInputActive(true)}
      >
        <SearchInputIcon onClick={handleProgrammaticSubmit} />
        <span className="hidden text-dsecondary lg:block">
          What are you looking for?
        </span>
      </span>

      <div
        ref={popoverSearchRef}
        className="fixed left-0 top-20 block w-screen lg:top-40"
      >
        <Transition
          show={isPopoverSearchInputActive}
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="px-4">
            <div className="mx-auto grid h-14 max-w-3xl place-items-center overflow-hidden rounded-lg	 bg-white px-4 shadow-2xl ring-1 ring-black ring-opacity-5 lg:h-20">
              {!!isPopoverSearchInputActive && (
                <Form
                  onSubmit={handleSubmitPostSearch((formData) => {
                    handleSearch(formData.searchInput)
                  })}
                >
                  <Input
                    {...registerPostSearch('searchInput')}
                    placeholder="What are you looking for?"
                    autoFocus={true}
                    isSpecial={true}
                    small={true}
                    validationErrorMessage={errorSearchInput?.message}
                    icon={
                      <SearchInputIcon onClick={handleProgrammaticSubmit} />
                    }
                    textAlignCenter={true}
                    hideBottomBorderForSpecial={true}
                  />
                </Form>
              )}
            </div>
          </div>
        </Transition>
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
                  <Link to={ROUTES.home} className="flex flex-row">
                    <div className="relative hidden h-8 w-8 sm:block">
                      <Image
                        className="z-0 inline-block object-contain"
                        src={img}
                        alt="Homepage header image"
                        fill={true}
                        sizes="10vw"
                      />
                    </div>
                    <div className="ml-2 text-left text-4xl font-extrabold leading-none tracking-tight">
                      <p className="bg-gradient-to-b from-dprimary to-dtertiary decoration-clone bg-clip-text text-3xl uppercase text-transparent">
                        Summora
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
                              : 'transition duration-200 hover:bg-dsecondary hover:text-white',
                            'group rounded-md px-3 py-2.5 text-sm font-semibold'
                          )}
                          aria-current={
                            route.href === asPath ? 'page' : undefined
                          }
                        >
                          {isValidElement<IconProps>(route.icon)
                            ? cloneElement<IconProps>(route.icon, {
                                className: `${
                                  !route.hideNameOnLargeScreen && 'mr-2'
                                } text-dsecondary group-hover:text-white`,
                                size: route.iconSize,
                              })
                            : undefined}
                          <span>
                            {!route.hideNameOnLargeScreen && route.name}
                          </span>
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
                        {isValidElement<IconProps>(route.icon)
                          ? cloneElement<IconProps>(route.icon, {
                              className:
                                'mr-2 text-dtertiary group-hover:text-white',
                              size: route.iconSize,
                            })
                          : undefined}
                        <span>{route.name}</span>
                      </Disclosure.Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-2 grid place-items-center">
                <DynamicCreatePostModal />
              </div>

              <div className="relative mx-auto my-6 grid h-14 w-14 place-items-center">
                <Image
                  className="z-0 inline-block object-contain"
                  src={img}
                  alt="Homepage header image"
                  fill={true}
                  sizes="10vw"
                />
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}
