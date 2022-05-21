import { ReactNode } from 'react'

export function TextGradient({
  children,
  big = false,
}: {
  children: ReactNode
  big?: boolean
}): JSX.Element {
  return (
    <div
      className={
        'font-bold ml-4 inline-block text-center leading-none tracking-tight' +
        ` ${!big ? 'text-sm md:text-lg' : 'text-2xl md:text-4xl'}`
      }
    >
      <span className="dvia-dbrown bg-gradient-to-br from-dorange to-dbrown decoration-clone bg-clip-text uppercase text-transparent">
        {children}
      </span>
    </div>
  )
}
