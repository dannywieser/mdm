import type { HabitMode } from "app-config"
import type { HabitHistoryEntry } from "services"

import { addDays, buildDateRange, getDateWindowStart } from "mdm-util"

import type { HabitEntry } from "../../types"

import { calculateHabitScore } from "./habits.scoring.util"

export const buildHistory = (
  entries: HabitEntry[],
  windowDays: number,
  mode: HabitMode,
  referenceDate: string,
): HabitHistoryEntry[] => {
  const sortedEntries = [...entries].sort((a, b) =>
    a.date.localeCompare(b.date),
  )
  if (sortedEntries.length === 0) return []

  const dates = buildDateRange(sortedEntries[0].date, referenceDate)

  // Sum entry values per date once up front, rather than re-filtering the
  // full entry list for every day in the (potentially long) history range.
  const valueByDate = new Map<string, number>()
  for (const entry of sortedEntries) {
    valueByDate.set(
      entry.date,
      (valueByDate.get(entry.date) ?? 0) + entry.value,
    )
  }

  return dates.map((date) => {
    const {
      habitScore,
      streak,
      uniqueWindowDays,
      windowStart,
      rawScore,
      scoreBeforeMultipliers,
      streakMultiplier,
      dayMultiplier,
      recentEntryAdditions,
    } = calculateHabitScore(sortedEntries, date, windowDays, mode)

    return {
      date,
      habitScore,
      streak,
      windowEntries: uniqueWindowDays,
      windowStart,
      rawScore,
      scoreBeforeMultipliers,
      streakMultiplier,
      dayMultiplier,
      recentEntryAdditions,
      value: valueByDate.get(date) ?? 0,
    }
  })
}

// For do-less habits: the minimum number of tracked days seen across any
// `windowDays`-length period, working backwards from `referenceDate`. The
// oldest period may be partial (if tracking started mid-window), and its
// raw entry count is used as-is.
export const calculateLowestDaysTrackedPerPeriod = (
  entries: HabitEntry[],
  referenceDate: string,
  windowDays: number,
): number => {
  if (entries.length === 0) return 0

  const uniqueDates = [...new Set(entries.map((e) => e.date))].toSorted(
    (a, b) => a.localeCompare(b),
  )
  const firstEntryDate = uniqueDates[0]

  const counts: number[] = []
  let periodEnd = referenceDate

  while (periodEnd >= firstEntryDate) {
    const periodStart = getDateWindowStart(periodEnd, windowDays - 1)
    const count = uniqueDates.filter(
      (d) => d >= periodStart && d <= periodEnd,
    ).length
    counts.push(count)
    periodEnd = addDays(periodStart, -1)
  }

  return Math.min(...counts)
}
