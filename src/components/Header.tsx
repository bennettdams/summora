import { useAuth } from '../services/auth-service'
import { useRouteChange } from '../util/use-route-change'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Link } from './Link'
import { LoadingAnimation } from './LoadingAnimation'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { MenuIcon, XIcon, BellIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'

const NAV_ROUTES = [
  { name: 'Home', href: '/' },
  { name: 'Explore', href: '/explore' },
] as const

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ')
}

function UserNavbar() {
  const { userAuth, user, isLoading: isLoadingAuth, signOut } = useAuth()

  return (
    <Menu as="div" className="relative">
      <div>
        {!userAuth ? (
          isLoadingAuth ? (
            <LoadingAnimation />
          ) : (
            <Link to="/signin">
              <Button onClick={() => console.info('here')}>Sign in</Button>
            </Link>
          )
        ) : (
          <Menu.Button className="flex rounded-full text-sm hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
            <div className="flex flex-row items-center text-white hover:text-lime-700">
              <p className="hidden px-2 sm:block">{user?.username}</p>
              <div className="flex items-center sm:ml-2">
                <Avatar
                  hasUserAvatar={user?.hasAvatar ?? false}
                  userId={userAuth.id}
                  size="small"
                />
              </div>
            </div>
          </Menu.Button>
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
        {userAuth && (
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <span
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'block px-4 py-2 text-sm text-gray-700'
                  )}
                >
                  <Link to={`/user/${userAuth.id}`}>Your profile</Link>
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={signOut}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'w-full px-4 py-2 text-left text-sm text-gray-700'
                  )}
                >
                  Sign out
                </button>
              )}
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
    <Disclosure as="nav" className="fixed top-0 z-40 w-full bg-green-900">
      {({ open }) => (
        <>
          <div className="max-w-7dxl mx-auto w-full px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button*/}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-lime-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Navbar content */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center">
                  <Link to="/">
                    <div className="text-left text-4xl font-extrabold leading-none tracking-tight">
                      <p className="bg-gradient-to-b from-amber-200 to-orange-300 decoration-clone bg-clip-text text-3xl uppercase text-transparent">
                        Condun
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Navbar nav items */}
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {NAV_ROUTES.map((route) => (
                      <a
                        key={route.name}
                        href={route.href}
                        className={classNames(
                          route.href === asPath
                            ? 'border-b border-b-lime-100 text-white'
                            : 'text-gray-300 hover:rounded-md hover:bg-lime-100 hover:text-lime-700',
                          'px-3 py-2 text-sm font-semibold'
                        )}
                        aria-current={
                          route.href === asPath ? 'page' : undefined
                        }
                      >
                        {route.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navbar right side */}
              <div className="absolute inset-y-0 right-0 flex items-center space-x-3 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isLoading && <LoadingAnimation />}

                <button
                  type="button"
                  className="rounded-full p-1 text-white hover:bg-lime-200 hover:text-lime-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                <UserNavbar />
              </div>
            </div>
          </div>

          {/* Navbar items mobile */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {NAV_ROUTES.map((route) => (
                <Disclosure.Button
                  key={route.name}
                  as="a"
                  href={route.href}
                  className={classNames(
                    route.href === asPath
                      ? 'rounded-md bg-lime-100 text-lime-700'
                      : 'text-gray-300 hover:rounded-md hover:bg-lime-100 hover:text-lime-700',
                    'block px-3 py-2 text-base font-semibold'
                  )}
                  aria-current={route.href === asPath ? 'page' : undefined}
                >
                  {route.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
