import type { StatsViewCount } from "../../types/stats"

/**
 * Returns a column count that keeps the grid compact and balanced:
 * - 1–3 items: single row (1, 2, or 3 cols)
 * - 4+ items: ceil(√n) so the grid stays roughly square
 */
export function getViewGridColumns(count: number): number {
  if (count <= 0) return 1
  if (count <= 3) return count
  return Math.ceil(Math.sqrt(count))
}

export interface ViewGroupSection {
  group: string
  views: StatsViewCount[]
}

export const groupViewsByGroup = (
  views: StatsViewCount[],
): { groups: ViewGroupSection[]; ungroupedViews: StatsViewCount[] } => {
  const ungroupedViews: StatsViewCount[] = []
  const groupedViews = new Map<string, StatsViewCount[]>()

  for (const view of views) {
    const group = view.group?.trim()

    if (!group) {
      ungroupedViews.push(view)
      continue
    }

    if (!groupedViews.has(group)) {
      groupedViews.set(group, [])
    }

    groupedViews.get(group)?.push(view)
  }

  return {
    groups: Array.from(groupedViews.entries()).map(([group, grouped]) => ({
      group,
      views: grouped,
    })),
    ungroupedViews,
  }
}
