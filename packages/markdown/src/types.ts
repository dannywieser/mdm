export type FrontmatterValue = string | string[]

export interface NoteFrontmatter {
  [key: string]: FrontmatterValue
}

export interface ParsedFrontMatter {
  body: string
  frontmatter: NoteFrontmatter | null
}
