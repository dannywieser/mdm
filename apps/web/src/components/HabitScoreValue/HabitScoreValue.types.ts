import type { HabitMode } from "../../types/habits"

export interface HabitScoreValueProps {
  mode: HabitMode
  score: number
  targetScore?: number
}
