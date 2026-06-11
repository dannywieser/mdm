import type { ViewSummary } from "../../types/views"

export type HomeProps = Record<string, never>

export interface ViewGroupSection {
  group: string
  views: ViewSummary[]
}

export interface HomeViewGroupSectionProps {
  group: string | null
  views: ViewSummary[]
}
