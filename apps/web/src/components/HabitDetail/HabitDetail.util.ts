import type { HabitMode } from "../../types/habits"

const HEAT_DOT_POINTS = 10

// "do-less" habits run hotter the further their score climbs above the
// target — render one heat dot per HEAT_DOT_POINTS the score sits above it.
export const calculateHeatDotCount = (
  mode: HabitMode,
  score: number,
  targetScore: number | undefined,
): number => {
  if (mode !== "do-less" || targetScore === undefined || score <= targetScore) return 0
  return Math.floor((score - targetScore) / HEAT_DOT_POINTS)
}

export const formatChartDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const formatRecentMultiplier = (multiplier: number | undefined): string =>
  multiplier === undefined ? "—" : `${multiplier}×`
