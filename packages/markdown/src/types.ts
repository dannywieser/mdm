export type FrontmatterValue = string | string[]

export interface MarkdownNode {
  alt?: string | null
  checked?: boolean | null
  children?: MarkdownNode[]
  depth?: number
  lang?: string | null
  ordered?: boolean
  start?: number | null
  title?: string | null
  type: string
  url?: string
  value?: string
  wikilinkType?: "matched" | "unmatched"
}

export interface NoteFrontmatter {
  [key: string]: FrontmatterValue
}

export interface Note {
  basename: string
  titleOrBodyDates: string[]
  createdDate: string | null
  frontmatter: NoteFrontmatter | null
  fullText: string
  folder: string
  fullPath: string
  content: MarkdownNode
  id: string
  linkedNotes?: Note[]
  modifiedDate: string
  obsidianUrl: string
  title: string
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
