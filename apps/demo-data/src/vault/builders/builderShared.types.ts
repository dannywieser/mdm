import type { VaultAttachment } from "../vault.types"

export interface CoverResult {
  attachment: VaultAttachment
  /** Vault-relative path stored in the note's `cover` frontmatter. */
  coverPath: string
}
