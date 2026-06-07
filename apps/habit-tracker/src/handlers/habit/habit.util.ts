import type { HabitMode } from "app-config"

import type { HabitEntry, HabitHistoryEntry, HabitScoreResult } from "./habit.types"

const RECENT_WINDOW_DAYS = 14
const RECENT_MULTIPLIER = 10
const BONUS_PER_UNIT = 0.005

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + "T00:00:00Z")
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export const getWindowStart = (referenceDate: string, windowDays: number): string =>
  addDays(referenceDate, -windowDays)

export const getWindowEntries = (
  entries: HabitEntry[],
  referenceDate: string,
  windowDays: number,
): HabitEntry[] => {
  const windowStart = getWindowStart(referenceDate, windowDays)
  return entries.filter((e) => e.date >= windowStart && e.date <= referenceDate)
}

const daysBetween = (fromDate: string, toDate: string): number => {
  const from = new Date(fromDate + "T00:00:00Z")
  const to = new Date(toDate + "T00:00:00Z")
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
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

// "Current" do-less streak: how long it's been since the habit was last logged,
// as of the reference date. An entry on the reference date itself resets this to 0.
export const calculateDaysSinceLastEntry = (entries: HabitEntry[], referenceDate: string): number => {
  const mostRecentDate = mostRecentDateOnOrBefore(entries.map((e) => e.date), referenceDate)
  if (!mostRecentDate) return 0
  return daysBetween(mostRecentDate, referenceDate)
}

// "Historical" do-less streak: the gap between this entry and the previous one,
// i.e. how long the habit went unlogged leading up to this entry.
export const calculateDaysBetweenEntries = (entries: HabitEntry[], referenceDate: string): number => {
  const priorDates = entries.filter((e) => e.date < referenceDate).map((e) => e.date)
  const mostRecentPriorDate = mostRecentDateOnOrBefore(priorDates, referenceDate)
  if (!mostRecentPriorDate) return 0
  return daysBetween(mostRecentPriorDate, referenceDate)
}

export const calculateStreak = (
  entries: HabitEntry[],
  referenceDate: string,
  mode: HabitMode,
  streakContext: "current" | "history",
): number => {
  if (mode === "do-more") return calculateConsecutiveEntryStreak(entries, referenceDate)
  return streakContext === "current"
    ? calculateDaysSinceLastEntry(entries, referenceDate)
    : calculateDaysBetweenEntries(entries, referenceDate)
}

export const calculateBaseScore = (
  windowEntries: HabitEntry[],
  referenceDate: string,
): number => {
  const recentCutoff = addDays(referenceDate, -RECENT_WINDOW_DAYS)
  return windowEntries.reduce((sum, entry) => {
    const multiplier = entry.date > recentCutoff ? RECENT_MULTIPLIER : 1
    return sum + entry.value * multiplier
  }, 0)
}

export const calculateHabitScore = (
  entries: HabitEntry[],
  referenceDate: string,
  windowDays: number,
  mode: HabitMode,
  streakContext: "current" | "history",
): HabitScoreResult => {
  const windowStart = getWindowStart(referenceDate, windowDays)
  const windowEntries = getWindowEntries(entries, referenceDate, windowDays)
  const baseScore = calculateBaseScore(windowEntries, referenceDate)
  const streak = calculateStreak(entries, referenceDate, mode, streakContext)

  const uniqueWindowDays = new Set(windowEntries.map((e) => e.date)).size
  const streakBonus = streak * BONUS_PER_UNIT
  const modeAdjustment =
    mode === "do-more"
      ? uniqueWindowDays * BONUS_PER_UNIT
      : -(uniqueWindowDays * BONUS_PER_UNIT)

  // toFixed rounds away floating-point representation noise (e.g. 524.9999999999999)
  // before flooring, so the result reflects the mathematically exact score.
  const score = Math.floor(Number((baseScore * (1 + streakBonus + modeAdjustment)).toFixed(6)))

  return { score, streak, uniqueWindowDays, windowStart }
}

export const buildHistory = (
  entries: HabitEntry[],
  windowDays: number,
  mode: HabitMode,
): HabitHistoryEntry[] => {
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const uniqueDates = [...new Set(sortedEntries.map((e) => e.date))]

  return uniqueDates.map((date) => {
    const { score, streak, uniqueWindowDays, windowStart } = calculateHabitScore(
      sortedEntries,
      date,
      windowDays,
      mode,
      "history",
    )
    return { date, score, streak, windowEntries: uniqueWindowDays, windowStart }
  })
}
