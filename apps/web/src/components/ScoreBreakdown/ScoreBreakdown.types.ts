import type { HabitMode } from "services"

export type { HabitMode }

export interface ScoreBreakdownProps {
  mode: HabitMode
  scoreBeforeMultipliers: number
  dayMultiplier: number
  streakMultiplier: number
  windowEntries: number
  streak: number
  habitScore: number
}

export interface BonusTier {
  startDay: number
  endDay: number
  rate: number
  days: number
  amount: number
}

export interface ScoreContributions {
  entryScores: number
  daysTiers: BonusTier[]
  streakTiers: BonusTier[]
}
