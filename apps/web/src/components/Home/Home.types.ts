import type { ViewSummary } from "../../types/views"

export type HomeProps = Record<string, never>

export interface ViewGroupSection {
  group: string
  views: ViewSummary[]
}
