import { useQueryClient } from 'react-query'
import { queryKeyPosts } from '../data/post-helper'
import { Link } from './Link'

export function Header(): JSX.Element {
  const queryClient = useQueryClient()

  return (
    <header className="h-12 z-40 w-full flex items-center justify-center top-0 fixed bg-lime-500">
      <div className="mx-auto w-full flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link to="/">
          <div className="text-left text-4xl font-extrabold leading-none tracking-tight">
            <span className="uppercase decoration-clone bg-clip-text text-transparent bg-gradient-to-b from-amber-400 to-orange-800">
              Condun
            </span>
          </div>
        </Link>
        <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
          <a className="mr-5 hover:text-gray-900">Some link</a>
        </nav>
        {process.env.NODE_ENV === 'development' && (
          <button
            className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0"
            onClick={async () => {
              await fetch('api/seed')
              queryClient.invalidateQueries(queryKeyPosts)
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
      </div>
    </header>
  )
}
