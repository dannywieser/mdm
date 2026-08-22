import type { TransactionOccurrence } from "services"

import {
  addDays,
  addMonths,
  buildDateRange,
  getDayOfWeek,
  getMonthEnd,
  getMonthKey,
  getMonthStart,
} from "mdm-util"

import type { TransactionCalendarDay, TransactionCalendarWeek } from "./TransactionCalendar.types"

const WEEK_LENGTH = 7
const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

/**
 * Falls back to the month containing `today` when the route carries no month
 * or a malformed one, so a hand-edited URL renders the current month instead
 * of an error.
 */
export const resolveMonthKey = (month: string | undefined, today: string): string =>
  month !== undefined && MONTH_KEY_PATTERN.test(month) ? month : getMonthKey(today)

export const shiftMonth = (monthKey: string, offset: number): string => addMonths(monthKey, offset)

export const formatMonthLabel = (monthKey: string): string =>
  new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" })

const groupByDate = (
  transactions: readonly TransactionOccurrence[],
): Map<string, TransactionOccurrence[]> => {
  const byDate = new Map<string, TransactionOccurrence[]>()
  for (const transaction of transactions) {
    const existing = byDate.get(transaction.date)
    if (existing) existing.push(transaction)
    else byDate.set(transaction.date, [transaction])
  }
  return byDate
}

const buildDay = (
  date: string,
  monthKey: string,
  today: string,
  byDate: Map<string, TransactionOccurrence[]>,
): TransactionCalendarDay => {
  const transactions = byDate.get(date) ?? []

  return {
    date,
    dayOfMonth: Number(date.slice(8, 10)),
    isCurrentMonth: date.startsWith(`${monthKey}-`),
    isToday: date === today,
    total: Math.round(transactions.reduce((sum, { amount }) => sum + amount, 0) * 100) / 100,
    transactions,
  }
}

/**
 * Builds the weeks of a wall-calendar grid for `monthKey`, padded at both
 * ends with the adjacent months' days so every row holds seven cells. Days
 * outside the month are kept (flagged `isCurrentMonth: false`) rather than
 * blanked, so the leading and trailing days stay readable.
 *
 * Every transaction is placed on its own date; occurrences the API returned
 * for other months are ignored, so a padded cell only ever shows a
 * transaction the caller actually loaded.
 */
export const buildCalendarWeeks = (
  monthKey: string,
  transactions: readonly TransactionOccurrence[],
  today: string,
): TransactionCalendarWeek[] => {
  const firstOfMonth = getMonthStart(monthKey)
  const gridStart = addDays(firstOfMonth, -getDayOfWeek(firstOfMonth))
  const lastOfMonth = getMonthEnd(monthKey)
  const trailingBlanks = WEEK_LENGTH - 1 - getDayOfWeek(lastOfMonth)
  const gridEnd = addDays(lastOfMonth, trailingBlanks)

  const byDate = groupByDate(transactions)
  const days = buildDateRange(gridStart, gridEnd).map((date) =>
    buildDay(date, monthKey, today, byDate),
  )

  const weeks: TransactionCalendarWeek[] = []
  for (let index = 0; index < days.length; index += WEEK_LENGTH) {
    const weekDays = days.slice(index, index + WEEK_LENGTH)
    weeks.push({ days: weekDays, key: weekDays[0].date })
  }
  return weeks
}
