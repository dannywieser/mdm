import type { HabitScoringConfig } from "./habitScoring.types"

// Matches the historical hardcoded defaults from habit-tracker's scoring logic.
export const DEFAULT_HABIT_SCORING: HabitScoringConfig = {
  baseBonusRate: 0.005,
  bonusRateIncrement: 0.001,
  bonusTierSize: 5,
  minStreakDays: 2,
  recentMultiplier: 10,
  recentWindowDays: 14,
}

const INTEGER_FIELDS = ["recentWindowDays", "bonusTierSize", "minStreakDays"] as const
const NUMBER_FIELDS = ["recentMultiplier", "baseBonusRate", "bonusRateIncrement"] as const

const isNonNegativeNumber = (value: unknown, requireInteger: boolean): boolean =>
  typeof value === "number" && value >= 0 && (!requireInteger || Number.isInteger(value))

export const isValidHabitScoringInput = (value: unknown): value is Partial<HabitScoringConfig> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false
  const obj = value as Record<string, unknown>
  return (
    INTEGER_FIELDS.every((key) => obj[key] === undefined || isNonNegativeNumber(obj[key], true)) &&
    NUMBER_FIELDS.every((key) => obj[key] === undefined || isNonNegativeNumber(obj[key], false))
  )
}

// Every field is independently optional and defaults to the value above; setting
// a field to 0 disables the bonus/penalty it controls (see habit-tracker's
// habit-detail.util.ts for how each field is interpreted as "off").
export const resolveHabitScoring = (value: Partial<HabitScoringConfig> | undefined): HabitScoringConfig => ({
  ...DEFAULT_HABIT_SCORING,
  ...value,
})
