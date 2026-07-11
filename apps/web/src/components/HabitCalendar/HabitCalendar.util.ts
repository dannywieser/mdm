import type { HabitHistoryEntry } from "services"

import {
  addMonths,
  buildDateRange,
  buildMonthRange,
  getDayOfWeek,
  getMonthEnd,
  getMonthKey,
  getMonthStart,
} from "mdm-util"

import type { HabitCalendarDay, HabitCalendarMonth, HabitCalendarWeek } from "./HabitCalendar.types"

const INTENSITY_LEVEL_COUNT = 4
const WEEK_LENGTH = 7
const MONTHS_TO_SHOW = 6

/**
 * Scales `value` relative to `maxValue` (the highest value shown anywhere in
 * the visualization) so the busiest day always reaches the top intensity
 * level, rather than assuming a fixed habit-value ceiling.
 */
const computeIntensityLevel = (value: number, maxValue: number): number => {
  if (value <= 0 || maxValue <= 0) return 0
  const ratio = Math.min(value, maxValue) / maxValue
  return Math.min(INTENSITY_LEVEL_COUNT, Math.ceil(ratio * INTENSITY_LEVEL_COUNT))
}

const formatMonthLabel = (monthKey: string): string =>
  new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

export const formatCalendarDate = (date: string): string =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const monthHasEntries = (monthKey: string, valueByDate: Map<string, number>): boolean =>
  buildDateRange(getMonthStart(monthKey), getMonthEnd(monthKey)).some(
    (date) => (valueByDate.get(date) ?? 0) > 0,
  )

const buildMonth = (
  monthKey: string,
  valueByDate: Map<string, number>,
  referenceDate: string,
  maxValue: number,
): HabitCalendarMonth => {
  const firstOfMonth = getMonthStart(monthKey)
  const lastOfMonth = getMonthEnd(monthKey)
  const leadingBlanks = getDayOfWeek(firstOfMonth)

  const cells: (HabitCalendarDay | null)[] = Array.from({ length: leadingBlanks }, () => null)
  for (const date of buildDateRange(firstOfMonth, lastOfMonth)) {
    const isFuture = date > referenceDate
    const value = valueByDate.get(date) ?? 0
    cells.push({ date, value, level: isFuture ? 0 : computeIntensityLevel(value, maxValue), isFuture })
  }
  while (cells.length % WEEK_LENGTH !== 0) {
    cells.push(null)
  }

  const weeks: HabitCalendarWeek[] = []
  for (let index = 0; index < cells.length; index += WEEK_LENGTH) {
    weeks.push({ days: cells.slice(index, index + WEEK_LENGTH) })
  }

  return { monthKey, label: formatMonthLabel(monthKey), weeks }
}

/**
 * Builds one calendar grid per month, covering the last 6 calendar months up
 * to the reference date and dropping any month with no tracked entries (e.g.
 * before the habit started, or a gap with nothing logged). Most recent month
 * first. Each week row starts on Sunday so the grid matches a standard
 * wall-calendar layout; days outside the month (padding) or after the
 * reference date are represented as `null`/`isFuture` rather than dropped,
 * so grid alignment is preserved.
 *
 * Intensity levels are scaled relative to the highest value shown anywhere
 * in the visualization (not a fixed habit-value ceiling), so the busiest day
 * across the displayed months is always the most intense color and every
 * other day scales back from it.
 */
export const buildHabitCalendarMonths = (
  history: readonly HabitHistoryEntry[],
  referenceDate: string,
): HabitCalendarMonth[] => {
  const valueByDate = new Map(history.map((entry) => [entry.date, entry.value]))
  const endMonthKey = getMonthKey(referenceDate)
  const startMonthKey = addMonths(endMonthKey, -(MONTHS_TO_SHOW - 1))
  const monthKeys = buildMonthRange(startMonthKey, endMonthKey).filter((monthKey) =>
    monthHasEntries(monthKey, valueByDate),
  )

  const monthKeySet = new Set(monthKeys)
  const maxValue = Math.max(
    0,
    ...history.filter((entry) => monthKeySet.has(getMonthKey(entry.date))).map((entry) => entry.value),
  )

  return monthKeys.map((monthKey) => buildMonth(monthKey, valueByDate, referenceDate, maxValue)).reverse()
}
