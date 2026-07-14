import type { VaultAttachment } from "../vault.types"

export interface CoverResult {
  attachment: VaultAttachment
  /** Vault-relative path embedded as an image in the note's body. */
  coverPath: string
}
