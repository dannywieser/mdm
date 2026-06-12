import type { ViewSummary } from "services"
import type { ViewGroupSection } from "./Home.types"

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

/**
 * Splits view cards into ungrouped cards and grouped sections for dashboard rendering.
 * Group insertion order is preserved based on the first time each group appears.
 * Missing or whitespace-only group values are treated as ungrouped views.
 */
export const groupViewsByGroup = (
  views: ViewSummary[],
): { groups: ViewGroupSection[]; ungroupedViews: ViewSummary[] } => {
  const ungroupedViews: ViewSummary[] = []
  const groupedViews = new Map<string, ViewSummary[]>()

  for (const view of views) {
    const group = view.group?.trim()

    if (view.count === 0) {
      continue
    }

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
