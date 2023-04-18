import { LinkExternal } from './link'

export function Footer(): JSX.Element {
  return (
    <footer>
      <div className="mx-auto flex flex-row items-center justify-center px-4 py-2">
        <a className="flex items-center justify-center font-semibold uppercase md:justify-start">
          <span className="ml-3 text-xl">Summora</span>
        </a>

        <p className="hidden text-sm sm:ml-4 sm:mt-0 sm:block sm:py-2 sm:pl-4">
          © 2023 Summora —
        </p>

        <LinkExternal
          to="https://twitter.com/bennettdams"
          className="ml-4 inline-flex flex-row items-start justify-center sm:mt-0 sm:justify-start lg:ml-1"
        >
          <span>
            <svg
              fill="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-5 w-5"
              viewBox="0 0 24 24"
            >
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
            </svg>
          </span>
          <span className="ml-1">@bennettdams</span>
        </LinkExternal>
      </div>
    </footer>
  )
}
