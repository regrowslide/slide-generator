import {DateInput} from '@cm/class/Days/date-utils/date-utils-type'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Days} from '@cm/class/Days/Days'
import {isServer} from '@cm/lib/methods/common'

export const getMidnight = (date?: Date) => {
  const dt = date ? new Date(date) : new Date()

  const year = dt.getFullYear()
  const month = dt.getMonth() + 1
  const day = dt.getDate()
  const hour = dt.getHours()
  const minute = dt.getMinutes()

  const midnightDate = new Date(year, month - 1, day, 0, 0, 0)

  console.log({
    date,
    time: `${year}-${month}-${day} ${hour}:${minute}`,
    midnightDate,
  }) //logs

  const isValidMidnightDate = (date: Date): boolean => date?.toISOString().includes(`15:00`)

  if (!isValidMidnightDate(midnightDate)) {
    console.warn(`getMidnight: failed to get midnight date`)
  }

  return midnightDate
}

export const toUtc = (date: DateInput): Date => {
  const dt = new Date(date)

  const isDate = isValidDate(dt)
  if (!isDate) {
    // throw new Error(`toUtc: ${dt} is not a date object`)
  }

  const result = addHours(dt, -9)

  return result
}

export const toJst = (date: DateInput): Date => {
  const dt = new Date(date)

  const isDate = isValidDate(dt)
  if (!isDate) {
    throw new Error(`toJst: ${dt} is not a date object`)
  }
  return addHours(dt, 9)
}

export const getMaxDate = (dates: Date[]): Date | null => {
  if (dates.length === 0) return null
  return new Date(Math.max(...dates.map(date => date.getTime())))
}

export const getMinimumDate = (dates: Date[]): Date | null => {
  if (dates.length === 0) return null
  return new Date(Math.min(...dates.map(date => date.getTime())))
}

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export const calcAge = (birthday: DateInput): number => {
  const today = new Date()
  const birthDate = new Date(birthday)

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// バリデーション関数
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}
