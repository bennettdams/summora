import { TwitterLink } from './TwitterLink'

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

        <TwitterLink />
      </div>
    </footer>
  )
}
