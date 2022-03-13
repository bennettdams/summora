export function Footer(): JSX.Element {
  return (
    <footer className="body-font">
      <div className="mx-auto flex flex-col items-center px-5 py-8 sm:flex-row">
        <a className="flex items-center justify-center font-semibold uppercase md:justify-start">
          <span className="ml-3 text-xl">Condun</span>
        </a>
        <p className="mt-4 text-sm sm:ml-4 sm:mt-0 sm:border-l-2 sm:border-dbrown sm:py-2 sm:pl-4">
          © 2021 Condun —
        </p>
        <span className="mt-4 inline-flex justify-center sm:ml-auto sm:mt-0 sm:justify-start">
          <a className="ml-3">
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
          </a>
          <a
            href="https://twitter.com/bennettdams"
            className="ml-1"
            rel="noopener noreferrer"
            target="_blank"
          >
            @bennettdams
          </a>
        </span>
      </div>
    </footer>
  )
}
