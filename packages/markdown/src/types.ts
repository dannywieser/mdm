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

export type NoteFrontmatter = Record<string, FrontmatterValue>;

export interface Note {
  basename: string
  dates: string[]
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

/**
 * A note with its frontmatter/dates/metadata parsed, but before the
 * expensive markdown AST parse + wikilink resolution step. Shared between
 * note sources (file scan, Bear sync ingest) and the handlers that turn a
 * ScannedNote into a full Note on demand.
 */
export type ScannedNote = Omit<Note, "content">

/** Request body accepted by the notes-ingest sync endpoint. */
export interface NoteSyncPayload {
  deletedIds: string[]
  upserts: ScannedNote[]
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
