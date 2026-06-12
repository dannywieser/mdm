import type { ViewSummary } from "services"

export type HomeProps = Record<string, never>

export interface ViewGroupSection {
  group: string
  views: ViewSummary[]
}
