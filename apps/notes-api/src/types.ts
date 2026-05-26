import type { NoteFrontmatter } from "markdown"

export type { FrontmatterValue, NoteFrontmatter } from "markdown"

export interface Note {
  basename: string
  createdDate: string
  frontmatter: NoteFrontmatter | null
  folder: string
  fullPath: string
  html: string
  id: string
  modifiedDate: string
}
