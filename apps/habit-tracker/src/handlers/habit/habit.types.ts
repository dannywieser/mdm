export interface HabitEntry {
  date: string
  value: number
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

export interface HabitResult {
  allTimeHighScore: number
  allTimeHighStreak: number
  allTimeHighWindowEntries: number
  habitId: string
  habitName: string
  history: HabitHistoryEntry[]
  habitScore: number
  streak: number
  streaks: HabitStreak[]
  totalEntries: number
  windowStart: string
  rawScore: number
  scoreBeforeMultipliers: number
  streakMultiplier: number
  dayMultiplier: number
  recentEntryAdditions: number
}
