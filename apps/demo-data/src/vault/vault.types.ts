export type DemoFrontmatter = Record<string, string | string[]>

export interface VaultNote {
  /** Markdown body written below the frontmatter block. */
  body: string
  /** Vault-relative folder, e.g. "library/books". */
  folder: string
  frontmatter: DemoFrontmatter
  /** ISO timestamp applied as the file's modification time. */
  modifiedDate: string
  /** Filename without the ".md" extension. */
  title: string
}

export interface VaultAttachment {
  /** SVG markup (string) or downloaded photo bytes (Buffer). */
  contents: string | Buffer
  /** ISO timestamp applied as the file's modification time. */
  modifiedDate: string
  /** Vault-relative path, e.g. "attachments/covers/books/dune.svg". */
  relativePath: string
}

export interface GeneratedVault {
  attachments: VaultAttachment[]
  notes: VaultNote[]
}

export interface VaultBuilderOptions {
  /** Inclusive "YYYY-MM-DD" end of the generated timeline (usually today). */
  endDate: string
  random: () => number
}
