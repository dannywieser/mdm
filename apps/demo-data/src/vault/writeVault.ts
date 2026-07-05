import { promises as fs } from "node:fs"
import path from "node:path"

import type { GeneratedVault } from "./vault.types"

import { serializeNote } from "./serializeNote"

const writeFileWithMtime = async (
  filePath: string,
  contents: string,
  modifiedDate: string,
): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, contents, "utf8")
  // Historic mtimes keep the stats endpoint realistic (e.g. "modified today").
  const modified = new Date(modifiedDate)
  await fs.utimes(filePath, modified, modified)
}

/** Writes the generated vault to disk, replacing any previous copy. */
export const writeVault = async (
  vault: GeneratedVault,
  vaultDirectory: string,
): Promise<void> => {
  await fs.rm(vaultDirectory, { force: true, recursive: true })

  for (const note of vault.notes) {
    await writeFileWithMtime(
      path.join(vaultDirectory, note.folder, `${note.title}.md`),
      serializeNote(note),
      note.modifiedDate,
    )
  }

  for (const attachment of vault.attachments) {
    await writeFileWithMtime(
      path.join(vaultDirectory, attachment.relativePath),
      attachment.contents,
      attachment.modifiedDate,
    )
  }
}
