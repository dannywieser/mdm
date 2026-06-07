import type { HabitMode } from "app-config"

import { addDays, buildDateRange, daysBetween, getDateWindowStart } from "mdm-util"

import type { HabitEntry, HabitHistoryEntry, HabitScoreEntry, HabitScoreResult, HabitStreak } from "./habit.types"

const RECENT_WINDOW_DAYS = 14
const RECENT_MULTIPLIER = 10
const BONUS_PER_UNIT = 0.005

// A `windowDays`-day window ending on (and including) `referenceDate` spans
// `windowDays - 1` days before it, so the inclusive [windowStart, referenceDate]
// range contains exactly `windowDays` calendar days.
export const getWindowEntries = (
  entries: HabitEntry[],
  referenceDate: string,
  windowDays: number,
): HabitEntry[] => {
  const windowStart = getDateWindowStart(referenceDate, windowDays - 1)
  return entries.filter((e) => e.date >= windowStart && e.date <= referenceDate)
}

export const calculateConsecutiveEntryStreak = (entries: HabitEntry[], referenceDate: string): number => {
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

const mostRecentDateOnOrBefore = (dates: string[], referenceDate: string): string | null => {
  const candidates = dates.filter((date) => date <= referenceDate)
  if (candidates.length === 0) return null
  return candidates.reduce((latest, date) => (date > latest ? date : latest))
}

// "do-less" streak: how long it's been since the habit was last logged, as of
// the reference date. An entry on the reference date itself resets this to 0.
export const calculateDaysSinceLastEntry = (entries: HabitEntry[], referenceDate: string): number => {
  const mostRecentDate = mostRecentDateOnOrBefore(entries.map((e) => e.date), referenceDate)
  if (!mostRecentDate) return 0
  return daysBetween(mostRecentDate, referenceDate)
}

export const calculateStreak = (entries: HabitEntry[], referenceDate: string, mode: HabitMode): number =>
  mode === "do-more"
    ? calculateConsecutiveEntryStreak(entries, referenceDate)
    : calculateDaysSinceLastEntry(entries, referenceDate)

// Sum of entry values with no recency multiplier applied.
export const calculateRawScore = (windowEntries: HabitEntry[]): number =>
  windowEntries.reduce((sum, entry) => sum + entry.value, 0)

// The extra amount each recent entry (within the last RECENT_WINDOW_DAYS)
// contributes on top of its raw value, i.e. (entry.value * RECENT_MULTIPLIER) - entry.value.
export const calculateRecentEntryAdditions = (
  windowEntries: HabitEntry[],
  referenceDate: string,
): number => {
  const recentCutoff = addDays(referenceDate, -RECENT_WINDOW_DAYS)
  return windowEntries.reduce((sum, entry) => {
    if (entry.date <= recentCutoff) return sum
    return sum + entry.value * (RECENT_MULTIPLIER - 1)
  }, 0)
}

// Per-entry breakdown of the entries contributing to the current score, most
// recent first, each annotated with the recency multiplier applied to it (if
// any) so the UI can explain how the score was derived.
export const buildScoreEntries = (
  windowEntries: HabitEntry[],
  referenceDate: string,
): HabitScoreEntry[] => {
  const recentCutoff = addDays(referenceDate, -RECENT_WINDOW_DAYS)
  return [...windowEntries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((entry) => ({
      date: entry.date,
      value: entry.value,
      recentMultiplier: entry.date > recentCutoff ? RECENT_MULTIPLIER : undefined,
      obsidianUrl: entry.obsidianUrl,
    }))
}

export const calculateBaseScore = (
  windowEntries: HabitEntry[],
  referenceDate: string,
): number =>
  calculateRawScore(windowEntries) + calculateRecentEntryAdditions(windowEntries, referenceDate)

export const calculateHabitScore = (
  entries: HabitEntry[],
  referenceDate: string,
  windowDays: number,
  mode: HabitMode,
): HabitScoreResult => {
  const windowStart = getDateWindowStart(referenceDate, windowDays - 1)
  const windowEntries = getWindowEntries(entries, referenceDate, windowDays)
  const rawScore = calculateRawScore(windowEntries)
  const recentEntryAdditions = calculateRecentEntryAdditions(windowEntries, referenceDate)
  const scoreBeforeMultipliers = rawScore + recentEntryAdditions
  const streak = calculateStreak(entries, referenceDate, mode)

  const uniqueWindowDays = new Set(windowEntries.map((e) => e.date)).size
  const streakMultiplier =
    mode === "do-more" ? streak * BONUS_PER_UNIT : -(streak * BONUS_PER_UNIT)
  const dayMultiplier = uniqueWindowDays * BONUS_PER_UNIT

  // toFixed rounds away floating-point representation noise (e.g. 524.9999999999999)
  // before flooring, so the result reflects the mathematically exact score.
  const habitScore = Math.floor(
    Number(
      (scoreBeforeMultipliers * (1 + dayMultiplier) * (1 + streakMultiplier)).toFixed(6),
    ),
  )

  return {
    habitScore,
    streak,
    uniqueWindowDays,
    windowStart,
    rawScore,
    scoreBeforeMultipliers,
    streakMultiplier,
    dayMultiplier,
    recentEntryAdditions,
  }
}

export const buildHistory = (
  entries: HabitEntry[],
  windowDays: number,
  mode: HabitMode,
  referenceDate: string,
): HabitHistoryEntry[] => {
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  if (sortedEntries.length === 0) return []

  const dates = buildDateRange(sortedEntries[0].date, referenceDate)

  // Sum entry values per date once up front, rather than re-filtering the
  // full entry list for every day in the (potentially long) history range.
  const valueByDate = new Map<string, number>()
  for (const entry of sortedEntries) {
    valueByDate.set(entry.date, (valueByDate.get(entry.date) ?? 0) + entry.value)
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

    const value = valueByDate.get(date) ?? 0

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
      value,
    }
  })
}

// "do-more" streaks: periods of consecutive days with a logged entry.
const buildConsecutiveEntryStreaks = (sortedDates: string[]): HabitStreak[] => {
  const streaks: HabitStreak[] = []
  let runStart: string | undefined

  sortedDates.forEach((date, index) => {
    if (runStart === undefined) runStart = date

    const nextDate = sortedDates[index + 1]
    if (nextDate === undefined || nextDate !== addDays(date, 1)) {
      streaks.push({ start: runStart, end: date, length: daysBetween(runStart, date) + 1 })
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

export const buildStreaks = (entries: HabitEntry[], mode: HabitMode): HabitStreak[] => {
  const sortedDates = [...new Set(entries.map((e) => e.date))].sort((a, b) => a.localeCompare(b))
  return mode === "do-more" ? buildConsecutiveEntryStreaks(sortedDates) : buildGapStreaks(sortedDates)
}
