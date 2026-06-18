import type { BonusTier, ScoreContributions } from "./ScoreBreakdown.types"

const TIER_SIZE = 5
const BASE_RATE = 0.005
const RATE_INCREMENT = 0.001

export const calculateTieredBreakdown = (count: number, baseAmount: number): BonusTier[] => {
  const tiers: BonusTier[] = []
  for (let i = 0; i < count; i += TIER_SIZE) {
    const tierIndex = Math.floor(i / TIER_SIZE)
    const startDay = i + 1
    const daysInTier = Math.min(TIER_SIZE, count - i)
    const endDay = i + daysInTier
    const rate = BASE_RATE + tierIndex * RATE_INCREMENT
    tiers.push({ startDay, endDay, rate, days: daysInTier, amount: baseAmount * daysInTier * rate })
  }
  return tiers
}

export const calculateScoreContributions = (
  scoreBeforeMultipliers: number,
  dayMultiplier: number,
  streakMultiplier: number,
  windowEntries: number,
  streak: number,
): ScoreContributions => {
  const afterDayBonus = scoreBeforeMultipliers * (1 + dayMultiplier)
  const streakSign = streakMultiplier >= 0 ? 1 : -1
  const daysTiers = calculateTieredBreakdown(windowEntries, scoreBeforeMultipliers)
  const streakTiers = calculateTieredBreakdown(streak, afterDayBonus).map((tier) => ({
    ...tier,
    amount: tier.amount * streakSign,
  }))
  return { entryScores: scoreBeforeMultipliers, daysTiers, streakTiers }
}

export const formatContributionAmount = (amount: number): string => {
  const rounded = Math.round(amount * 10) / 10
  const sign = rounded >= 0 ? "+" : ""
  return `${sign}${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}`
}

export const formatTierLabel = (prefix: string, startDay: number, endDay: number, rate: number): string =>
  `${prefix} ${startDay}–${endDay} × ${(rate * 100).toFixed(1)}%`
