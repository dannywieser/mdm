export interface HabitScoringConfig {
  baseBonusRate: number
  bonusRateIncrement: number
  bonusTierSize: number
  minStreakDays: number
  recentMultiplier: number
  recentWindowDays: number
}
