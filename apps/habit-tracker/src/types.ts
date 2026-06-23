export interface HabitEntry {
  date: string
  value: number
  obsidianUrl: string
}

export interface HabitScoreResult {
  habitScore: number
  streak: number
  uniqueWindowDays: number
  windowStart: string
  rawScore: number
  scoreBeforeMultipliers: number
  streakMultiplier: number
  dayMultiplier: number
  recentEntryAdditions: number
}
