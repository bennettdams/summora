// REFERENCE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat

import { isServer } from './utils'

const defaultLanguage: string = isServer() ? 'en' : navigator.language

const dateTimeFormatters = {
  'hh:mm': formatDateToHourAndMinute,
  'hh:mm:ss': formatDateToHourAndMinuteAndSecond,
  'MM-DD': formatDateToMonthAndDay,
  'MM-DD hh:mm': formatDateToMonthAndDayAndHourAndMinute,
  'MM-DD hh:mm:ss': formatDateToMonthAndDayAndHourAndMinuteAndSecond,
  'YYYY-MM-DD': formatDateToYearAndMonthAndDay,
  'YYYY-MM-DD hh:mm': formatDateToYearAndMonthAndDayAndHourAndMinute,
  'UTC YYYY-MM-DD': formatDateToUTCYearAndMonthAndDay,
} as const

export type DateTimeFormat = keyof typeof dateTimeFormatters

/**
 * Global function to format date-time.
 */
export function formatDateTime(date: Date, format: DateTimeFormat) {
  return dateTimeFormatters[format](date)
}

/**
 * String representation with hours & minutes of a date.
 * @param date Date object to format
 * @returns formatted string for client time zone, e.g. "15:34"
 */
function formatDateToHourAndMinute(date: Date): string {
  return date.toLocaleTimeString(defaultLanguage, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}

/**
 * String representation with hours, minutes & seconds of a date.
 * @param date Date object to format
 * @returns formatted string for client time zone, e.g. "15:34:12"
 */
function formatDateToHourAndMinuteAndSecond(date: Date): string {
  return date.toLocaleTimeString(defaultLanguage, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
}

/**
 * String representation with month & day of a date.
 * @param date Date object to format
 * @returns formatted string for client time zone, e.g. "05/22"
 */
function formatDateToMonthAndDay(date: Date): string {
  return date.toLocaleDateString(defaultLanguage, {
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * String representation with year, month and day of a date.
 * @param date Date object to format
 * @returns formatted string for client time zone, e.g. "24.12.2021"
 */
function formatDateToYearAndMonthAndDay(date: Date): string {
  return date.toLocaleDateString(defaultLanguage, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * String representation with months, days, hours & minutes of a date.
 * @param date Date object to format
 * @returns formatted string for client time zone, e.g. "25-11 15:34"
 */
function formatDateToMonthAndDayAndHourAndMinute(date: Date): string {
  return `${formatDateToMonthAndDay(date)} ${formatDateToHourAndMinute(date)}`
}

/**
 * String representation with months, days, hours, minutes & seconds of a date.
 * @param date Date object to format
 * @returns formatted string for client time zone, e.g. "25-11 15:34:12"
 */
function formatDateToMonthAndDayAndHourAndMinuteAndSecond(date: Date): string {
  return `${formatDateToMonthAndDay(date)} ${formatDateToHourAndMinuteAndSecond(
    date
  )}`
}

/**
 * String representation with year, months, days, hours & minutes of a date.
 * @param date Date object to format
 * @returns formatted string for client time zone, e.g. "06/30/2022 18:22"
 */
function formatDateToYearAndMonthAndDayAndHourAndMinute(date: Date): string {
  return `${formatDateToYearAndMonthAndDay(date)} ${formatDateToHourAndMinute(
    date
  )}`
}

/**
 * String representation in the format YYYY-MM-DD.
 *
 * We take the time zone of the date into account.
 * With that offset, we create a new date which now is a "wrong date":
 * e.g.
 * - the given date is at
 *    4 pm with UTC +2 hours
 * - the new date including the offset is then at
 *    6 pm with UTC +2 hours
 *
 * This is obviously false, but we want to use the "toISOString" method, which uses
 * UTC. By creating this "false" date, the ISO string will be for the right day and time.
 *
 * If we would not take the time zone offset into account, "toISOString" could give us the wrong day & time
 * when the given date is around midnight, because UTC could jump to the previous/next day.
 *
 * @returns formatted string for client time zone, e.g. "2021-11-25"
 */
function formatDateToUTCYearAndMonthAndDay(date: Date): string {
  const minutesOffset = date.getTimezoneOffset()
  const millisecondsOffset = minutesOffset * 60 * 1000
  const falseLocalDate = new Date(date.getTime() - millisecondsOffset)

  return falseLocalDate.toISOString().substring(0, 10)
}
