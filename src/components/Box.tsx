import { ReactNode, RefObject } from 'react'

export function Box({
  children,
  noPadding = false,
  smallPadding = false,
  onClick,
  refExternal,
  isHighlighted = false,
}: {
  children: ReactNode
  onClick?: () => void
  refExternal?: RefObject<HTMLDivElement>
  isHighlighted?: boolean
} & (
  | { smallPadding?: boolean; noPadding?: never }
  | { smallPadding?: never; noPadding?: boolean }
)): JSX.Element {
  return (
    <div
      onClick={() => onClick && onClick()}
      ref={refExternal}
      className={`box rounded-xl shadow-md hover:shadow-lg ${
        noPadding ? 'p-0' : smallPadding ? 'p-4' : 'p-10'
      } ${onClick && 'cursor-pointer'} ${
        !isHighlighted ? 'bg-white' : 'from-fuchsia-200 to-blue-200'
      }`}
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
