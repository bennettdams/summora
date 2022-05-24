type Size = 'normal' | 'small' | 'tiny'

function getSize(size: Size): string {
  switch (size) {
    case 'normal': {
      return 'h-10 w-10'
    }
    case 'small': {
      return 'h-6 w-6'
    }
    case 'tiny': {
      return 'h-4 w-4'
    }
    default: {
      return 'h-10 w-10'
    }
  }
}

export function LoadingAnimation({
  size = 'normal',
  light = false,
}: {
  size?: Size
  light?: boolean
}): JSX.Element {
  return (
    <span className="inline" title="Loading..">
      <svg
        className={`inline animate-spin ${
          light ? 'text-dbrown' : 'text-dlila'
        } ${getSize(size)}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
  )
}
