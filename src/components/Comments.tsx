import { ReactNode } from 'react'

export function Comments({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="text-gray-400 inline-flex items-center leading-none text-sm">
      <svg
        className="w-4 h-4 mr-1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
      </svg>
      {children}
    </span>
  )
}
