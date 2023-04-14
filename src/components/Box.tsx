import { ReactNode, RefObject } from 'react'

export function Box({
  children,
  onClick,
  refExternal,
  isHighlighted = false,
  inline = false,
  padding = 'medium',
  hideBorder = false,
  showShadow = false,
}: {
  children: ReactNode
  onClick?: () => void
  refExternal?: RefObject<HTMLDivElement>
  isHighlighted?: boolean
  inline?: boolean
  padding?: false | 'small' | 'medium'
  hideBorder?: boolean
  showShadow?: boolean
}): JSX.Element {
  return (
    <div
      onClick={() => onClick && onClick()}
      ref={refExternal}
      className={`box rounded-xl ${
        showShadow && 'transition duration-200 hover:shadow-xl'
      } ${!hideBorder && 'border border-gray-300'} ${
        padding === false
          ? 'p-0'
          : padding === 'small'
          ? 'p-1 md:p-4'
          : padding === 'medium'
          ? 'p-2 md:p-10'
          : ''
      } ${onClick && 'cursor-pointer'} ${
        !isHighlighted ? 'bg-white' : 'from-fuchsia-200 to-blue-200'
      } ${inline && 'inline-block'}`}
    >
      {children}
    </div>
  )
}

// export function BoxLink(props: BoxProps & LinkProps): JSX.Element {
//   const [isCliekd, setIsClicked] = useState(false)
//   const isLoading = useRouteChange(isCliekd)

//   return (
//     <div onClick={() => setIsClicked(true)}>
//       <Link {...props}>
//         <Box {...props} isLoading={isLoading}>
//           {props.children}
//         </Box>
//       </Link>
//     </div>
//   )
// }
