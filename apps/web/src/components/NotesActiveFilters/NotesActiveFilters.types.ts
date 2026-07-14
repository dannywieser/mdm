export interface ActiveFilterChip {
  label: string
  paramKey: string
  value: string
}

export interface NotesActiveFiltersProps {
  selectedFrontmatter: Record<string, string[]>
  selectedYears: number[]
}
