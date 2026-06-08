import type { HabitMode } from "app-config"

export interface HabitSummary {
  habitId: string
  habitName: string
  habitScore: number
  mode: HabitMode
  streak: number
  targetScore: number | undefined
  windowEntries: number
}
