export const formatContributionAmount = (amount: number): string => {
  const rounded = Math.round(amount * 10) / 10
  const sign = rounded >= 0 ? "+" : ""
  return `${sign}${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}`
}

export const formatTierLabel = (prefix: string, startDay: number, endDay: number, rate: number): string =>
  `${prefix} ${startDay}–${endDay} × ${(rate * 100).toFixed(1)}%`
