import { ReactNode } from 'react'
import { TextGradient } from './TextGradient'

export function Title({ children }: { children: ReactNode }): JSX.Element {
  return <TextGradient big>{children}</TextGradient>
}
