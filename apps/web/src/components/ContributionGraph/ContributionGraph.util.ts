import type { StatsHistoryResponse } from "services"

import { buildDateRange } from "mdm-util"

import type { ContributionDay, ContributionYear } from "./ContributionGraph.types"

const ACTIVITY_LEVEL_COUNT = 4

const computeActivityLevel = (totalActivity: number, maxActivity: number): number => {
  if (totalActivity === 0 || maxActivity === 0) return 0
  const ratio = totalActivity / maxActivity
  return Math.min(ACTIVITY_LEVEL_COUNT, Math.ceil(ratio * ACTIVITY_LEVEL_COUNT))
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
  const maxActivity = Math.max(0, ...totals)

  return dates.map((date, index) => {
    const entry = entriesByDate.get(date)
    return {
      date,
      entriesCreated: entry?.entriesCreated ?? 0,
      entriesModified: entry?.entriesModified ?? 0,
      foldersTouched: entry?.foldersTouched ?? 0,
      totalActivity: totals[index],
      level: computeActivityLevel(totals[index], maxActivity),
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
