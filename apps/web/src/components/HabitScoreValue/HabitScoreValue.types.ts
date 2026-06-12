import type { HabitMode } from "services"

export interface HabitScoreValueProps {
  mode: HabitMode
  score: number
  targetScore?: number
}
