import { render } from '@testing-library/react'
import React, { ComponentType, ReactElement } from 'react'
// import { ThemeProvider } from "my-ui-lib"
// import { TranslationProvider } from "my-i18n-lib"
// import defaultStrings from "i18n/en-x-default"

const Providers = ({ children }: { children: ReactElement }): ReactElement => {
  return children
  // return (
  //   <ThemeProvider theme="light">
  //     <TranslationProvider messages={defaultStrings}>
  //       {children}
  //     </TranslationProvider>
  //   </ThemeProvider>
  // )
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: Providers as ComponentType, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
