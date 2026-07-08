import type { StatsHistoryResponse } from "services"

import { buildDateRange } from "mdm-util"

import type { ContributionDay, ContributionYear } from "./ContributionGraph.types"

const ACTIVITY_LEVEL_COUNT = 4
const OUTLIER_MEDIAN_MULTIPLIER = 5
const OUTLIER_MIN_THRESHOLD = 30

const computeActivityLevel = (totalActivity: number, typicalMax: number): number => {
  if (totalActivity === 0 || typicalMax === 0) return 0
  const ratio = Math.min(totalActivity, typicalMax) / typicalMax
  return Math.min(ACTIVITY_LEVEL_COUNT, Math.ceil(ratio * ACTIVITY_LEVEL_COUNT))
}

const computeMedian = (sortedValues: number[]): number => {
  const middle = Math.floor(sortedValues.length / 2)
  return sortedValues.length % 2 === 0
    ? (sortedValues[middle - 1] + sortedValues[middle]) / 2
    : sortedValues[middle]
}

/**
 * Days above this threshold are treated as outliers so a single bulk-edit day
 * doesn't compress every other day's shading toward the low end. The median
 * (rather than the mean or max) stays representative of a typical day even
 * when a handful of extreme days are mixed into the data. The threshold never
 * drops below OUTLIER_MIN_THRESHOLD so a low historical baseline (e.g. a
 * vault that's just ramping up activity) doesn't flag ordinary growth.
 */
const computeOutlierThreshold = (totals: number[]): number => {
  const activeTotals = totals.filter((total) => total > 0).sort((a, b) => a - b)
  if (activeTotals.length === 0) return Infinity

  const median = computeMedian(activeTotals)
  return Math.max(median * OUTLIER_MEDIAN_MULTIPLIER, OUTLIER_MIN_THRESHOLD)
}

/**
 * Fills every date between the first and last history entry (inclusive) so
 * the grid has a slot for zero-activity days, not just the sparse dates the
 * API returns.
 */
export const buildContributionDays = (history: StatsHistoryResponse): ContributionDay[] => {
  if (history.length === 0) return []

  const entriesByDate = new Map(history.map((entry) => [entry.date, entry]))
  const dates = buildDateRange(history[0].date, history[history.length - 1].date)
  const totals = dates.map((date) => {
    const entry = entriesByDate.get(date)
    return (entry?.entriesCreated ?? 0) + (entry?.entriesModified ?? 0)
  })
  const outlierThreshold = computeOutlierThreshold(totals)
  const typicalMax = Math.max(0, ...totals.filter((total) => total <= outlierThreshold))
  const maxOutlier = Math.max(0, ...totals.filter((total) => total > outlierThreshold))

  return dates.map((date, index) => {
    const entry = entriesByDate.get(date)
    const totalActivity = totals[index]
    const isOutlier = totalActivity > outlierThreshold
    return {
      date,
      entriesCreated: entry?.entriesCreated ?? 0,
      entriesModified: entry?.entriesModified ?? 0,
      foldersTouched: entry?.foldersTouched ?? 0,
      totalActivity,
      level: computeActivityLevel(totalActivity, typicalMax),
      isOutlier,
      outlierLevel: isOutlier ? computeActivityLevel(totalActivity, maxOutlier) : 0,
    }
  })
}

/**
 * Splits days into one grid per calendar year (most recent year first). Each
 * grid is rendered with an auto-filling column count so it stretches to the
 * container's full width, wrapping into as many rows as needed — years stack
 * vertically instead of the grid ever needing to scroll horizontally.
 */
export const buildContributionYears = (days: readonly ContributionDay[]): ContributionYear[] => {
  const daysByYear = new Map<string, ContributionDay[]>()

  for (const day of days) {
    const year = day.date.slice(0, 4)
    const yearDays = daysByYear.get(year)
    if (yearDays) {
      yearDays.push(day)
    } else {
      daysByYear.set(year, [day])
    }
  }

  return Array.from(daysByYear.entries())
    .map(([year, yearDays]) => ({ days: yearDays, year }))
    .sort((a, b) => b.year.localeCompare(a.year))
}

export const formatContributionDate = (date: string): string =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
