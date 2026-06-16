import type { HabitMode } from "app-config"

export type { HabitMode }

export interface HabitSummary {
  habitId: string
  habitName: string
  habitScore: number
  mode: HabitMode
  streak: number
  targetScore?: number
  windowEntries: number
}

export interface HabitHistoryEntry {
  date: string
  habitScore: number
  streak: number
  windowEntries: number
  windowStart: string
  rawScore: number
  scoreBeforeMultipliers: number
  streakMultiplier: number
  dayMultiplier: number
  recentEntryAdditions: number
  value: number
}

export interface HabitStreak {
  start: string
  end: string
  length: number
}

export interface HabitScoreEntry {
  date: string
  value: number
  recentMultiplier?: number
  obsidianUrl: string
}

export interface HabitResult {
  allTimeHighScore: number
  allTimeHighStreak: number
  allTimeHighWindowEntries: number
  habitId: string
  habitName: string
  habitScore: number
  history: HabitHistoryEntry[]
  lowestDaysTrackedPerPeriod?: number
  mode: HabitMode
  scoreEntries: HabitScoreEntry[]
  streak: number
  streaks: HabitStreak[]
  targetScore?: number
  trackingWindowDays: number
  windowEntries: number
  windowStart: string
  rawScore: number
  scoreBeforeMultipliers: number
  streakMultiplier: number
  dayMultiplier: number
  recentEntryAdditions: number
}
