import type { StatsHistoryResponse } from "services"

export interface ContributionGraphProps {
  history: StatsHistoryResponse
}

export interface ContributionDay {
  date: string
  entriesCreated: number
  entriesModified: number
  foldersTouched: number
  totalActivity: number
  level: number
  isOutlier: boolean
  outlierLevel: number
}

export interface ContributionYear {
  year: string
  days: ContributionDay[]
}
