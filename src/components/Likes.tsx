import { ReactNode } from 'react'

export function Views({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="text-gray-400 inline-flex items-center leading-none text-sm py-1">
      <svg
        className="w-4 h-4 mr-1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      {children}
    </span>
  )
}
