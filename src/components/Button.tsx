import { ReactNode } from 'react'

export function Button({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={
        'p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50' +
        ' transition duration-75 ease-in-out bg-green-200 hover:bg-green-300 transform hover:-translate-y-1 hover:scale-105'
      }
    >
      {children}
    </button>
  )
}
