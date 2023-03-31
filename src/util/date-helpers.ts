export function createDateFromThePast(variant: 'day' | 'week' | 'month'): Date {
  const now = new Date()
  /** Used to multiply with 24 to resemble the given time range. */
  let modifierDays = null

  switch (variant) {
    case 'day': {
      modifierDays = 1
      break
    }
    case 'week': {
      modifierDays = 7
      break
    }
    case 'month': {
      modifierDays = 30
      break
    }
  }

  return new Date(now.setHours(now.getHours() - 24 * modifierDays))
}
