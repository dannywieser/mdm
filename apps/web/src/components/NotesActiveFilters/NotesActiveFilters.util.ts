import {
  buildFrontmatterParamKey,
  YEAR_PARAM_KEY,
} from "../NotesFilterFacetGroup/NotesFilterFacetGroup.util"

import type { ActiveFilterChip } from "./NotesActiveFilters.types"

export function buildActiveFilterChips(
  selectedYears: number[],
  selectedFrontmatter: Record<string, string[]>,
): ActiveFilterChip[] {
  const yearChips = selectedYears.map((year) => ({
    label: String(year),
    paramKey: YEAR_PARAM_KEY,
    value: String(year),
  }))

  const frontmatterChips = Object.entries(selectedFrontmatter).flatMap(([key, values]) =>
    values.map((value) => ({
      label: `${key}: ${value}`,
      paramKey: buildFrontmatterParamKey(key),
      value,
    })),
  )

  return [...yearChips, ...frontmatterChips]
}
