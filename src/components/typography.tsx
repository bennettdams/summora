import { ReactNode } from 'react'

export function Title({ children }: { children: ReactNode }): JSX.Element {
  return <TextGradient big={true}>{children}</TextGradient>
}

export function Subtitle({ children }: { children: ReactNode }): JSX.Element {
  return <TextGradient big={false}>{children}</TextGradient>
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
        ` ${big ? 'text-3xl lg:text-4xl' : 'text-xl lg:text-2xl'}`
      }
    >
      <span
        className={`bg-gradient-to-br from-dsecondary to-dtertiary decoration-clone bg-clip-text text-transparent`}
      >
        {children}
      </span>
    </div>
  )
}

export function NoContent({ children }: { children: ReactNode }): JSX.Element {
  return (
    <p className="text-center text-lg italic leading-relaxed text-dsecondary">
      {children}
    </p>
  )
}