export type HabitMode = "do-more" | "do-less"

export interface HabitSummary {
  habitId: string
  habitName: string
  habitScore: number
  mode: HabitMode
  streak: number
  targetScore?: number
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

export interface HabitResult {
  allTimeHighScore: number
  allTimeHighStreak: number
  habitId: string
  habitName: string
  habitScore: number
  history: HabitHistoryEntry[]
  mode: HabitMode
  streak: number
  streaks: HabitStreak[]
  targetScore?: number
  windowEntries: number
}
