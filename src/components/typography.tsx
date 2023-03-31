import { ReactNode } from 'react'

export function Title({ children }: { children: ReactNode }): JSX.Element {
  return <TextGradient big>{children}</TextGradient>
}

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
        'inline-block text-center font-serif font-semibold leading-none tracking-tight' +
        ` ${!big ? 'text-xl lg:text-3xl' : 'text-3xl lg:text-4xl'}`
      }
    >
      <span className="bg-gradient-to-br from-dsecondary to-dtertiary decoration-clone bg-clip-text text-transparent">
        {children}
      </span>
    </div>
  )
}
