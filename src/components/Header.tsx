import { useAuth } from '../services/auth-service'
import { useRouteChange } from '../util/use-route-change'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { LoadingAnimation } from './LoadingAnimation'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { MenuIcon, XIcon, BellIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import { IconEdit } from './Icon'
import { FormInput } from './FormInput'
import {
  apiCreatePost,
  ApiPostsCreateRequestBody,
} from '../services/api-service'
import { CategorySelect } from './CategorySelect'
import { Modal, useModal } from './modal'
import { ROUTES } from '../services/routing'
import { Link } from './link'

const NAV_ROUTES = [
  { name: 'home', href: ROUTES.home },
  { name: 'explore', href: ROUTES.explore },
] as const

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ')
}

function UserNavbar() {
  const { userAuth, user, isLoading: isLoadingAuth, signOut } = useAuth()

  return (
    <Menu as="div" className="relative">
      <div className="grid place-items-end md:min-w-[150px]">
        {isLoadingAuth ? (
          <LoadingAnimation />
        ) : userAuth === null && !isLoadingAuth ? (
          <Link to={ROUTES.signIn}>
            <Button onClick={() => console.info('here')}>Sign in</Button>
          </Link>
        ) : (
          userAuth !== null &&
          !isLoadingAuth && (
            <Menu.Button className="flex rounded-full text-sm hover:bg-dorange focus:outline-none focus:ring-2 focus:ring-dlight">
              <div className="flex flex-row items-center text-white">
                <p className="hidden px-2 sm:block">{user?.username}</p>
                <div className="flex items-center sm:ml-2">
                  <Avatar
                    userId={userAuth.id}
                    username={user?.username ?? ''}
                    imageId={user?.imageId ?? null}
                    imageBlurDataURL={user?.imageBlurDataURL ?? null}
                    size="small"
                    placeholderColorVariant="orange"
                  />
                </div>
              </div>
            </Menu.Button>
          )
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
            <Link to={ROUTES.user(userAuth.id)}>
              <Menu.Item>
                {({ active }) => (
                  <span
                    className={classNames(
                      active && 'bg-dorange text-white',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    Your profile
                  </span>
                )}
              </Menu.Item>
            </Link>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={signOut}
                  className={classNames(
                    active && 'bg-dorange text-white',
                    'w-full px-4 py-2 text-left text-sm '
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
    <Disclosure as="nav" className="bg-dbrown">
      {({ open }) => (
        <>
          <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button*/}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-dlila hover:bg-dlight focus:outline-none focus:ring-2 focus:ring-inset focus:ring-dlight">
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
                  <Link to={ROUTES.home}>
                    <div className="text-left text-4xl font-extrabold leading-none tracking-tight">
                      <p className="bg-gradient-to-b from-amber-100 to-orange-100 decoration-clone bg-clip-text text-3xl uppercase text-transparent">
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
                            ? 'border-b border-b-white text-white'
                            : 'hover:rounded-md hover:bg-dorange hover:text-white',
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
                <div className="hidden sm:block">
                  <CreatePostModal />
                </div>

                {isLoading && <LoadingAnimation />}

                <button
                  type="button"
                  className="rounded-full p-1 text-white hover:bg-dorange focus:outline-none focus:ring-2 focus:ring-white"
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
            <div className="grid place-items-center">
              <CreatePostModal />
            </div>

            <div className="space-y-1 px-2 pt-2 pb-3">
              {NAV_ROUTES.map((route) => (
                <Disclosure.Button
                  key={route.name}
                  as="a"
                  href={route.href}
                  className={classNames(
                    route.href === asPath
                      ? 'rounded-md bg-dorange'
                      : 'hover:rounded-md hover:bg-dorange',
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

const formId = 'create-post-form'

function CreatePostModal() {
  const { isOpen, open, close } = useModal()
  const router = useRouter()

  const [inputs, setInputs] = useState<{
    title: string | null
    subtitle: string | null
    categoryId: string | null
  }>({ title: null, subtitle: null, categoryId: null })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (inputs && inputs.title && inputs.subtitle && inputs.categoryId) {
      const postToCreate: ApiPostsCreateRequestBody = {
        postToCreate: {
          title: inputs.title,
          subtitle: inputs.subtitle,
          categoryId: inputs.categoryId,
        },
      }

      const response = await apiCreatePost(postToCreate)
      const postCreated = response.result
      if (postCreated) {
        close()
        await router.push(ROUTES.post(postCreated.id))
      }
    }
  }

  return (
    <>
      <Button onClick={open}>
        <IconEdit /> <span className="ml-2">Create Post</span>
      </Button>

      <Modal
        isOpen={isOpen}
        open={open}
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

        <div className="mx-auto mt-10 w-full first-letter:mb-10 lg:w-3/4">
          <form className="w-full" id={formId} onSubmit={handleSubmit}>
            <div className="mt-4 space-y-10">
              <FormInput
                placeholder="Title.."
                initialValue=""
                onChange={(input) => {
                  if (input) {
                    setInputs((prev) => ({ ...prev, title: input }))
                  }
                }}
                formId={formId}
              >
                Title
              </FormInput>

              <FormInput
                placeholder="Subtitle.."
                initialValue=""
                onChange={(input) =>
                  setInputs((prev) => ({ ...prev, subtitle: input }))
                }
                autoFocus={false}
                formId={formId}
              >
                Subtitle
              </FormInput>

              {/* fixed height to give the dropdown room to grow */}
              <div className="h-60">
                <CategorySelect
                  onSelect={(selectedCategory) =>
                    setInputs((prev) => ({
                      ...prev,
                      categoryId: selectedCategory.id,
                    }))
                  }
                  shouldShowDropdown={true}
                />
              </div>
            </div>

            <div className="mx-auto grid place-items-center">
              <Button isSubmit onClick={handleSubmit}>
                Create
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}
