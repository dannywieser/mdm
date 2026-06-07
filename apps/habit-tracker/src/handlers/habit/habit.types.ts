export interface HabitEntry {
  date: string
  value: number
}

export interface HabitScoreResult {
  score: number
  streak: number
  uniqueWindowDays: number
  windowStart: string
}

export interface HabitHistoryEntry {
  date: string
  score: number
  streak: number
  windowEntries: number
  windowStart: string
}

export interface HabitResult {
  allTimeHighScore: number
  allTimeHighStreak: number
  allTimeHighWindowEntries: number
  habitId: string
  habitName: string
  history: HabitHistoryEntry[]
  score: number
  streak: number
  totalEntries: number
  windowStart: string
}
