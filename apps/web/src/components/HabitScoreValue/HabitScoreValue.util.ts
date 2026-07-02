import type { HabitMode } from "services"

export type HabitScoreStatus = "green" | "yellow" | "red" | "neutral"

// "do-less" status bands scale with targetScore: green below 50% of target,
// yellow below 75%, red from 75% upward (a target of 100 means green 0-50,
// yellow 50-75, red 75+). Habits without a configured targetScore render neutral.
export const getDoLessScoreStatus = (score: number, targetScore?: number): HabitScoreStatus => {
  if (targetScore === undefined) return "neutral"
  if (score < targetScore * 0.5) return "green"
  if (score < targetScore * 0.75) return "yellow"
  return "red"
}

// How far a do-less score sits above its target. Returns undefined when
// there's nothing to report (wrong mode, no target, or at/under target).
export const getHabitScoreOverage = (mode: HabitMode, score: number, targetScore?: number): number | undefined => {
  if (mode !== "do-less" || targetScore === undefined || score <= targetScore) return undefined
  return score - targetScore
}

export const getHabitScoreColor = (mode: HabitMode, score: number, targetScore?: number): string => {
  if (mode === "do-more") return "app.accent"

  switch (getDoLessScoreStatus(score, targetScore)) {
    case "green":
      return "green.500"
    case "yellow":
      return "yellow.500"
    case "red":
      return "red.500"
    default:
      return "app.text"
  }
}
