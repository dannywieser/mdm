import type { HabitMode, HabitScoreBreakdown, HabitScoreTier } from "services"

export type { HabitMode, HabitScoreBreakdown, HabitScoreTier }

export interface ScoreBreakdownProps {
  mode: HabitMode
  breakdown: HabitScoreBreakdown
  habitScore: number
}
