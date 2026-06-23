import type { HabitMode } from "app-config"
import type { HabitStreak } from "services"

import { addDays, daysBetween } from "mdm-util"

import type { HabitEntry } from "../../types"

const mostRecentDateOnOrBefore = (
  dates: string[],
  referenceDate: string,
): string | null => {
  const candidates = dates.filter((date) => date <= referenceDate)
  if (candidates.length === 0) return null
  return candidates.reduce(
    (latest, date) => (date > latest ? date : latest),
    candidates[0],
  )
}

export const calculateConsecutiveEntryStreak = (
  entries: HabitEntry[],
  referenceDate: string,
): number => {
  const entryDates = new Set(
    entries.filter((e) => e.date <= referenceDate).map((e) => e.date),
  )
  if (!entryDates.has(referenceDate)) return 0
  let streak = 0
  let currentDate = referenceDate
  while (entryDates.has(currentDate)) {
    streak++
    currentDate = addDays(currentDate, -1)
  }
  return streak
}

// "do-less" streak: how long it's been since the habit was last logged, as of
// the reference date. An entry on the reference date itself resets this to 0.
export const calculateDaysSinceLastEntry = (
  entries: HabitEntry[],
  referenceDate: string,
): number => {
  const mostRecentDate = mostRecentDateOnOrBefore(
    entries.map((e) => e.date),
    referenceDate,
  )
  if (!mostRecentDate) return 0
  return daysBetween(mostRecentDate, referenceDate)
}

export const calculateStreak = (
  entries: HabitEntry[],
  referenceDate: string,
  mode: HabitMode,
): number =>
  mode === "do-more"
    ? calculateConsecutiveEntryStreak(entries, referenceDate)
    : calculateDaysSinceLastEntry(entries, referenceDate)

// "do-more" streaks: periods of consecutive days with a logged entry.
const buildConsecutiveEntryStreaks = (sortedDates: string[]): HabitStreak[] => {
  const streaks: HabitStreak[] = []
  let runStart: string | undefined

  sortedDates.forEach((date, index) => {
    runStart ??= date

    const nextDate = sortedDates.at(index + 1)
    if (nextDate === undefined || nextDate !== addDays(date, 1)) {
      streaks.push({
        start: runStart,
        end: date,
        length: daysBetween(runStart, date) + 1,
      })
      runStart = undefined
    }
  })

  return streaks
}

// "do-less" streaks: gaps of consecutive days without a logged entry that fall
// strictly between two logged entries (excludes the time before the first entry
// and the ongoing gap after the most recent entry).
const buildGapStreaks = (sortedDates: string[]): HabitStreak[] => {
  const streaks: HabitStreak[] = []

  for (let index = 1; index < sortedDates.length; index++) {
    const previousDate = sortedDates[index - 1]
    const currentDate = sortedDates[index]
    const gap = daysBetween(previousDate, currentDate)

    if (gap > 1) {
      const start = addDays(previousDate, 1)
      const end = addDays(currentDate, -1)
      streaks.push({ start, end, length: gap - 1 })
    }
  }

  return streaks
}

export const buildStreaks = (
  entries: HabitEntry[],
  mode: HabitMode,
): HabitStreak[] => {
  const sortedDates = [...new Set(entries.map((e) => e.date))].sort((a, b) =>
    a.localeCompare(b),
  )
  return mode === "do-more"
    ? buildConsecutiveEntryStreaks(sortedDates)
    : buildGapStreaks(sortedDates)
}
