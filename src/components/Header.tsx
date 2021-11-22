import { useAuth } from '../services/auth-service'
import { useRouteChange } from '../util/use-route-change'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Link } from './Link'
import { LoadingAnimation } from './LoadingAnimation'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { MenuIcon, XIcon, BellIcon } from '@heroicons/react/outline'

/**
 * FROM https://tailwindui.com/components/application-ui/navigation/navbars
 */

const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false },
]

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
          <Menu.Button className="bg-gray-800d flex text-sm rounded-full focus:outline-none hover:bg-lime-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
            <div className="flex flex-row items-center text-white hover:text-lime-700">
              <p className="px-2 hidden sm:block">{user?.username}</p>
              <div className="sm:ml-2 inline">
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
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                    'w-full px-4 py-2 text-sm text-left text-gray-700'
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

  return (
    <Disclosure as="nav" className="w-full z-40 fixed top-0 bg-green-900">
      {({ open }) => (
        <>
          <div className="max-w-7dxl w-full mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              {/* Mobile menu button*/}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Navbar content */}
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <div className="text-left text-4xl font-extrabold leading-none tracking-tight">
                      <span className="uppercase decoration-clone bg-clip-text text-transparent bg-gradient-to-b from-amber-400 to-orange-800">
                        Condun
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Navbar nav items */}
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navbar right side */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-3">
                {process.env.NODE_ENV === 'development' && (
                  <button
                    className="inline-flex items-center border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0"
                    onClick={async () => {
                      await fetch('api/seed')
                    }}
                  >
                    Seed
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="w-4 h-4 ml-1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </button>
                )}
                {isLoading && <LoadingAnimation />}
                <button
                  type="button"
                  className="text-white hover:text-lime-700 hover:bg-lime-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
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
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
