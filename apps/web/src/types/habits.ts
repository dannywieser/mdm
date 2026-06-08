export type HabitMode = "do-more" | "do-less"

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
  mode: HabitMode
  scoreEntries: HabitScoreEntry[]
  streak: number
  streaks: HabitStreak[]
  targetScore?: number
  windowEntries: number
  windowStart: string
}
