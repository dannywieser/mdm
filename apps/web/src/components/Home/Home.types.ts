import type { StatsViewCount } from "../../types/stats"

export type HomeProps = Record<string, never>

export interface ViewGroupSection {
  group: string
  views: StatsViewCount[]
}

export interface HomeViewGroupSectionProps {
  group: string | null
  views: StatsViewCount[]
}
