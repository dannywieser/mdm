export type FrontmatterValue = string | string[]

export interface NoteFrontmatter {
  [key: string]: FrontmatterValue
}

export interface Note {
  basename: string
  bodyDates: string[]
  createdDate: string
  frontmatter: NoteFrontmatter | null
  folder: string
  fullPath: string
  html: string
  id: string
  modifiedDate: string
}

export interface ParsedFrontMatter {
  body: string
  frontmatter: NoteFrontmatter | null
}

export interface ParsedDate {
  day: number
  month: number
  year: number
}
