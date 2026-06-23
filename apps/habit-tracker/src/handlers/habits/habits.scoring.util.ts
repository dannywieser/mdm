import type { HabitMode } from "app-config"
import type { HabitScoreBreakdown, HabitScoreEntry, HabitScoreTier } from "services"

import { addDays, getDateWindowStart } from "mdm-util"

import type { HabitEntry, HabitScoreResult } from "../../types"

import { calculateStreak } from "./habits.streak.util"

const RECENT_WINDOW_DAYS = 14
const RECENT_MULTIPLIER = 10
const BONUS_TIER_SIZE = 5
const BASE_BONUS_RATE = 0.005
const BONUS_RATE_INCREMENT = 0.001

// Tiered multiplier: each group of BONUS_TIER_SIZE days earns a higher per-day
// rate (0.5% for days 1–5, 0.6% for days 6–10, etc.).
const calculateTieredMultiplier = (count: number): number => {
  let multiplier = 0
  for (let i = 0; i < count; i++) {
    multiplier +=
      BASE_BONUS_RATE + Math.floor(i / BONUS_TIER_SIZE) * BONUS_RATE_INCREMENT
  }
  return Number(multiplier.toFixed(6))
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

// Sum of entry values with no recency multiplier applied.
export const calculateRawScore = (windowEntries: HabitEntry[]): number =>
  windowEntries.reduce((sum, entry) => sum + entry.value, 0)

// The extra amount each recent entry (the last RECENT_WINDOW_DAYS, inclusive of
// the day exactly RECENT_WINDOW_DAYS ago) contributes on top of its raw value,
// i.e. (entry.value * RECENT_MULTIPLIER) - entry.value.
export const calculateRecentEntryAdditions = (
  windowEntries: HabitEntry[],
  referenceDate: string,
): number => {
  const recentCutoff = addDays(referenceDate, -RECENT_WINDOW_DAYS)
  return windowEntries.reduce((sum, entry) => {
    if (entry.date < recentCutoff) return sum
    return sum + entry.value * (RECENT_MULTIPLIER - 1)
  }, 0)
}

export const calculateBaseScore = (
  windowEntries: HabitEntry[],
  referenceDate: string,
): number =>
  calculateRawScore(windowEntries) +
  calculateRecentEntryAdditions(windowEntries, referenceDate)

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
      recentMultiplier:
        entry.date >= recentCutoff ? RECENT_MULTIPLIER : undefined,
      obsidianUrl: entry.obsidianUrl,
    }))
}

export const buildTieredBreakdown = (
  count: number,
  baseAmount: number,
): HabitScoreTier[] => {
  const tiers: HabitScoreTier[] = []
  for (let i = 0; i < count; i += BONUS_TIER_SIZE) {
    const tierIndex = Math.floor(i / BONUS_TIER_SIZE)
    const startDay = i + 1
    const daysInTier = Math.min(BONUS_TIER_SIZE, count - i)
    const endDay = i + daysInTier
    const rate = BASE_BONUS_RATE + tierIndex * BONUS_RATE_INCREMENT
    tiers.push({
      startDay,
      endDay,
      rate,
      days: daysInTier,
      amount: baseAmount * daysInTier * rate,
    })
  }
  return tiers
}

export const buildScoreBreakdown = (
  scoreBeforeMultipliers: number,
  dayMultiplier: number,
  streakMultiplier: number,
  uniqueWindowDays: number,
  streak: number,
): HabitScoreBreakdown => {
  const afterDayBonus = scoreBeforeMultipliers * (1 + dayMultiplier)
  const streakSign = streakMultiplier >= 0 ? 1 : -1
  const daysTiers = buildTieredBreakdown(uniqueWindowDays, scoreBeforeMultipliers)
  const streakTiers = buildTieredBreakdown(streak, afterDayBonus).map((tier) => ({
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
): HabitScoreResult => {
  const windowStart = getDateWindowStart(referenceDate, windowDays - 1)
  const windowEntries = getWindowEntries(entries, referenceDate, windowDays)
  const rawScore = calculateRawScore(windowEntries)
  const recentEntryAdditions = calculateRecentEntryAdditions(windowEntries, referenceDate)
  const scoreBeforeMultipliers = rawScore + recentEntryAdditions
  const streak = calculateStreak(entries, referenceDate, mode)

  const uniqueWindowDays = new Set(windowEntries.map((e) => e.date)).size
  const tieredStreakMultiplier = calculateTieredMultiplier(streak)
  const streakMultiplier =
    mode === "do-more" ? tieredStreakMultiplier : -tieredStreakMultiplier
  const dayMultiplier = calculateTieredMultiplier(uniqueWindowDays)

  // toFixed rounds away floating-point representation noise (e.g. 524.9999999999999)
  // before flooring, so the result reflects the mathematically exact score.
  const habitScore = Math.floor(
    Number(
      (
        scoreBeforeMultipliers *
        (1 + dayMultiplier) *
        (1 + streakMultiplier)
      ).toFixed(6),
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
