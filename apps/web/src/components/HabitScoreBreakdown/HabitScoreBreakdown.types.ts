import type { HabitMode, HabitScoreBreakdown, HabitScoreTier } from "services"

export type { HabitMode, HabitScoreBreakdown, HabitScoreTier }

export interface HabitScoreBreakdownProps {
  mode: HabitMode
  breakdown: HabitScoreBreakdown
  habitScore: number
}
