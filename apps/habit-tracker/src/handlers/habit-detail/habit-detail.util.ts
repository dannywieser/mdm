import type { HabitMode, HabitScoringConfig } from "app-config"
import type { HabitScoreBreakdown, HabitScoreTier } from "services"

import { addDays, buildDateRange, daysBetween, getDateWindowStart } from "mdm-util"

import type { HabitEntry, HabitHistoryEntry, HabitScoreEntry, HabitScoreResult, HabitStreak } from "./habit-detail.types"

// A tiered day/streak bonus is off entirely when there's no tier size to group
// days into, or when every tier's rate would be zero anyway.
const isBonusDisabled = ({ bonusTierSize, baseBonusRate, bonusRateIncrement }: HabitScoringConfig): boolean =>
  bonusTierSize <= 0 || (baseBonusRate <= 0 && bonusRateIncrement <= 0)

// Tiered multiplier: each group of `bonusTierSize` days earns a higher per-day
// rate (`baseBonusRate` for the first tier, plus `bonusRateIncrement` per tier
// beyond that).
const calculateTieredMultiplier = (count: number, scoring: HabitScoringConfig): number => {
  if (isBonusDisabled(scoring)) return 0
  const { bonusTierSize, baseBonusRate, bonusRateIncrement } = scoring
  let multiplier = 0
  for (let i = 0; i < count; i++) {
    multiplier += baseBonusRate + Math.floor(i / bonusTierSize) * bonusRateIncrement
  }
  return multiplier
}

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

// Requires at least `minStreakDays` consecutive entries before it's reported
// as a streak, since a single logged day hasn't yet spanned a full day-over-day
// gap and shouldn't read as an established streak. A `minStreakDays` of 0
// removes this threshold entirely.
export const calculateConsecutiveEntryStreak = (
  entries: HabitEntry[],
  referenceDate: string,
  minStreakDays: number,
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
  return streak < minStreakDays ? 0 : streak
}

const mostRecentDateOnOrBefore = (dates: string[], referenceDate: string): string | null => {
  const candidates = dates.filter((date) => date <= referenceDate)
  if (candidates.length === 0) return null
  return candidates.reduce((latest, date) => (date > latest ? date : latest), candidates[0])
}

// "do-less" streak: how long it's been since the habit was last logged, as of
// the reference date. An entry on the reference date itself resets this to 0.
export const calculateDaysSinceLastEntry = (entries: HabitEntry[], referenceDate: string): number => {
  const mostRecentDate = mostRecentDateOnOrBefore(entries.map((e) => e.date), referenceDate)
  if (!mostRecentDate) return 0
  return daysBetween(mostRecentDate, referenceDate)
}

export const calculateStreak = (
  entries: HabitEntry[],
  referenceDate: string,
  mode: HabitMode,
  minStreakDays: number,
): number =>
  mode === "do-more"
    ? calculateConsecutiveEntryStreak(entries, referenceDate, minStreakDays)
    : calculateDaysSinceLastEntry(entries, referenceDate)

// Sum of entry values with no recency multiplier applied.
export const calculateRawScore = (windowEntries: HabitEntry[]): number =>
  windowEntries.reduce((sum, entry) => sum + entry.value, 0)

// The extra amount each recent entry (the last `recentWindowDays`, inclusive of
// the day exactly `recentWindowDays` ago) contributes on top of its raw value,
// i.e. (entry.value * recentMultiplier) - entry.value. Disabled (returns 0)
// when either `recentWindowDays` or `recentMultiplier` is 0.
export const calculateRecentEntryAdditions = (
  windowEntries: HabitEntry[],
  referenceDate: string,
  scoring: HabitScoringConfig,
): number => {
  const { recentWindowDays, recentMultiplier } = scoring
  if (recentWindowDays <= 0 || recentMultiplier <= 0) return 0
  const recentCutoff = addDays(referenceDate, -recentWindowDays)
  return windowEntries.reduce((sum, entry) => {
    if (entry.date < recentCutoff) return sum
    return sum + entry.value * (recentMultiplier - 1)
  }, 0)
}

// Per-entry breakdown of the entries contributing to the current score, most
// recent first, each annotated with the recency multiplier applied to it (if
// any) so the UI can explain how the score was derived.
export const buildScoreEntries = (
  windowEntries: HabitEntry[],
  referenceDate: string,
  scoring: HabitScoringConfig,
): HabitScoreEntry[] => {
  const { recentWindowDays, recentMultiplier } = scoring
  const recentBonusEnabled = recentWindowDays > 0 && recentMultiplier > 0
  const recentCutoff = addDays(referenceDate, -recentWindowDays)
  return [...windowEntries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((entry) => ({
      date: entry.date,
      value: entry.value,
      recentMultiplier: recentBonusEnabled && entry.date >= recentCutoff ? recentMultiplier : undefined,
      obsidianUrl: entry.obsidianUrl,
    }))
}

export const calculateBaseScore = (
  windowEntries: HabitEntry[],
  referenceDate: string,
  scoring: HabitScoringConfig,
): number =>
  calculateRawScore(windowEntries) + calculateRecentEntryAdditions(windowEntries, referenceDate, scoring)

export const buildTieredBreakdown = (
  count: number,
  baseAmount: number,
  scoring: HabitScoringConfig,
): HabitScoreTier[] => {
  if (isBonusDisabled(scoring)) return []
  const { bonusTierSize, baseBonusRate, bonusRateIncrement } = scoring
  const tiers: HabitScoreTier[] = []
  for (let i = 0; i < count; i += bonusTierSize) {
    const tierIndex = Math.floor(i / bonusTierSize)
    const startDay = i + 1
    const daysInTier = Math.min(bonusTierSize, count - i)
    const endDay = i + daysInTier
    const rate = baseBonusRate + tierIndex * bonusRateIncrement
    tiers.push({ startDay, endDay, rate, days: daysInTier, amount: baseAmount * daysInTier * rate })
  }
  return tiers
}

export const buildScoreBreakdown = (
  scoreBeforeMultipliers: number,
  dayMultiplier: number,
  streakMultiplier: number,
  uniqueWindowDays: number,
  streak: number,
  scoring: HabitScoringConfig,
): HabitScoreBreakdown => {
  const afterDayBonus = scoreBeforeMultipliers * (1 + dayMultiplier)
  const streakSign = streakMultiplier >= 0 ? 1 : -1
  const daysTiers = buildTieredBreakdown(uniqueWindowDays, scoreBeforeMultipliers, scoring)
  const streakTiers = buildTieredBreakdown(streak, afterDayBonus, scoring).map((tier) => ({
    ...tier,
    amount: tier.amount * streakSign,
  }))
  return { entryScores: scoreBeforeMultipliers, daysTiers, streakTiers }
}

export const calculateHabitScore = (
  entries: HabitEntry[],
  referenceDate: string,
  windowDays: number,
  mode: HabitMode,
  scoring: HabitScoringConfig,
): HabitScoreResult => {
  const windowStart = getDateWindowStart(referenceDate, windowDays - 1)
  const windowEntries = getWindowEntries(entries, referenceDate, windowDays)
  const rawScore = calculateRawScore(windowEntries)
  const recentEntryAdditions = calculateRecentEntryAdditions(windowEntries, referenceDate, scoring)
  const scoreBeforeMultipliers = rawScore + recentEntryAdditions
  const streak = calculateStreak(entries, referenceDate, mode, scoring.minStreakDays)

  const uniqueWindowDays = new Set(windowEntries.map((e) => e.date)).size
  const tieredStreakMultiplier = calculateTieredMultiplier(streak, scoring)
  const streakMultiplier = mode === "do-more" ? tieredStreakMultiplier : -tieredStreakMultiplier
  const dayMultiplier = calculateTieredMultiplier(uniqueWindowDays, scoring)

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
  scoring: HabitScoringConfig,
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
    } = calculateHabitScore(sortedEntries, date, windowDays, mode, scoring)

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
    runStart ??= date

    const nextDate = sortedDates.at(index + 1)
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

// For do-less habits: the minimum number of tracked days seen across any
// complete `windowDays`-length period, working backwards from `referenceDate`.
// A trailing period that starts before tracking began is only partial (there
// weren't enough days for a fair count) and is discarded rather than counted
// as-is. Returns `undefined` if no complete period exists yet.
export const calculateLowestDaysTrackedPerPeriod = (
  entries: HabitEntry[],
  referenceDate: string,
  windowDays: number,
): number | undefined => {
  if (entries.length === 0) return 0

  const uniqueDates = [...new Set(entries.map((e) => e.date))].toSorted((a, b) => a.localeCompare(b))
  const firstEntryDate = uniqueDates[0]

  const counts: number[] = []
  let periodEnd = referenceDate

  while (periodEnd >= firstEntryDate) {
    const periodStart = getDateWindowStart(periodEnd, windowDays - 1)
    if (periodStart < firstEntryDate) break

    const count = uniqueDates.filter((d) => d >= periodStart && d <= periodEnd).length
    counts.push(count)
    periodEnd = addDays(periodStart, -1)
  }

  return counts.length === 0 ? undefined : Math.min(...counts)
}
