export interface ContributionGraphProps {
  staleTime?: number
}

export interface ContributionDay {
  date: string
  entriesCreated: number
  entriesModified: number
  foldersTouched: number
  totalActivity: number
  level: number
}

export interface ContributionYear {
  year: string
  days: ContributionDay[]
}
