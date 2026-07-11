import type { HabitHistoryEntry } from "services"

import { addDays, buildDateRange, getDateWindowStart, getDayOfWeek } from "mdm-util"

import type { HabitCalendarDay, HabitCalendarMonth, HabitCalendarWeek } from "./HabitCalendar.types"

const INTENSITY_LEVEL_COUNT = 4
const HABIT_VALUE_MAX = 10
const WEEK_LENGTH = 7
const TRACKING_WINDOW_MULTIPLE = 2

const computeIntensityLevel = (value: number): number => {
  if (value <= 0) return 0
  const ratio = Math.min(value, HABIT_VALUE_MAX) / HABIT_VALUE_MAX
  return Math.min(INTENSITY_LEVEL_COUNT, Math.ceil(ratio * INTENSITY_LEVEL_COUNT))
}

const getMonthKey = (date: string): string => date.slice(0, 7)

const getFirstOfMonth = (monthKey: string): string => `${monthKey}-01`

const getDaysInMonth = (monthKey: string): number => {
  const [year, month] = monthKey.split("-").map(Number)
  return new Date(year, month, 0).getDate()
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

/**
 * Lists every "YYYY-MM" month key from `startMonthKey` to `endMonthKey`
 * (inclusive, ascending) without relying on day-level date arithmetic, so it
 * can't be thrown off by months of differing lengths.
 */
const enumerateMonthKeys = (startMonthKey: string, endMonthKey: string): string[] => {
  const [startYear, startMonth] = startMonthKey.split("-").map(Number)
  const [endYear, endMonth] = endMonthKey.split("-").map(Number)
  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth)

  return Array.from({ length: totalMonths + 1 }, (_, index) => {
    const monthIndex = startMonth - 1 + index
    const year = startYear + Math.floor(monthIndex / 12)
    const month = (monthIndex % 12) + 1
    return `${year}-${String(month).padStart(2, "0")}`
  })
}

const buildMonth = (
  monthKey: string,
  valueByDate: Map<string, number>,
  referenceDate: string,
): HabitCalendarMonth => {
  const firstOfMonth = getFirstOfMonth(monthKey)
  const lastOfMonth = addDays(firstOfMonth, getDaysInMonth(monthKey) - 1)
  const leadingBlanks = getDayOfWeek(firstOfMonth)

  const cells: (HabitCalendarDay | null)[] = Array.from({ length: leadingBlanks }, () => null)
  for (const date of buildDateRange(firstOfMonth, lastOfMonth)) {
    const isFuture = date > referenceDate
    const value = valueByDate.get(date) ?? 0
    cells.push({ date, value, level: isFuture ? 0 : computeIntensityLevel(value), isFuture })
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
 * Builds one calendar grid per month, spanning from two tracking windows ago
 * through the reference date, most recent month first. Each week row starts
 * on Sunday so the grid matches a standard wall-calendar layout; days outside
 * the month (padding) or after the reference date are represented as
 * `null`/`isFuture` rather than dropped, so grid alignment is preserved.
 */
export const buildHabitCalendarMonths = (
  history: readonly HabitHistoryEntry[],
  referenceDate: string,
  trackingWindowDays: number,
): HabitCalendarMonth[] => {
  const rangeStart = getDateWindowStart(referenceDate, trackingWindowDays * TRACKING_WINDOW_MULTIPLE)
  const valueByDate = new Map(history.map((entry) => [entry.date, entry.value]))
  const monthKeys = enumerateMonthKeys(getMonthKey(rangeStart), getMonthKey(referenceDate))

  return monthKeys
    .map((monthKey) => buildMonth(monthKey, valueByDate, referenceDate))
    .reverse()
}
