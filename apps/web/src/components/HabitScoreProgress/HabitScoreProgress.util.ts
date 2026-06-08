// Fraction of the bar filled by the score, capped at the target so the
// fill never exceeds the base bar — overflow is rendered separately.
export const calculateProgressFraction = (score: number, targetScore: number): number =>
  Math.min(score / targetScore, 1)

// How far the score sits above the target, expressed relative to the
// target itself — used to size the red overflow segment proportionally.
export const calculateOverflowRatio = (score: number, targetScore: number): number =>
  Math.max((score - targetScore) / targetScore, 0)
