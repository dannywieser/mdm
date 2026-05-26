export type FrontmatterValue = string | string[]

export interface NoteFrontmatter {
  [key: string]: FrontmatterValue
}

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
