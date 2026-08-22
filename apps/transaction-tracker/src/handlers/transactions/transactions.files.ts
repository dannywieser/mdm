import { resolveNotesConfig } from "app-config"
import { buildObsidianUrl, FILE_ID_NAMESPACE, parseFrontMatter } from "markdown"
import { createFileID, mapWithConcurrency } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { TransactionDefinition } from "./transactions.types"

import { buildTransactionDefinition } from "./transactions.util"
import { isInFolder } from "./transactionsFolder"

// Bounded concurrency: an unbounded read of a large vault exhausts the
// process file-descriptor limit.
const FILE_READ_CONCURRENCY = 64

/**
 * Restricts the scan to the configured folder. An empty `folder` scans the
 * whole vault; otherwise only notes inside that vault-relative directory are
 * considered, so a vault can keep finance notes separate from everything else.
 */
export const isInTransactionsFolder = (
  filePath: string,
  notesDirectory: string,
  folder: string,
): boolean =>
  isInFolder(path.relative(notesDirectory, filePath).split(path.sep).join("/"), folder)

/** Reads every markdown file in the vault and returns the ones that are transactions. */
export const scanTransactionDefinitions = async (
  filePaths: readonly string[],
): Promise<TransactionDefinition[]> => {
  const { createdDateProperty, dateFormats, notesDirectory, obsidianVault, transactions } =
    await resolveNotesConfig()

  const candidates = filePaths.filter((filePath) =>
    isInTransactionsFolder(filePath, notesDirectory, transactions.folder),
  )

  const results = await mapWithConcurrency(candidates, FILE_READ_CONCURRENCY, async (filePath) => {
    const source = await fs.readFile(filePath, "utf8")
    const { frontmatter } = parseFrontMatter(source)
    const basename = path.basename(filePath)

    return buildTransactionDefinition(
      frontmatter,
      {
        noteId: createFileID(filePath, FILE_ID_NAMESPACE),
        obsidianUrl: buildObsidianUrl(obsidianVault, notesDirectory, filePath),
        title: basename.replace(/\.[^.]+$/, ""),
      },
      transactions,
      createdDateProperty,
      dateFormats,
    )
  })

  return results.filter((definition): definition is TransactionDefinition => definition !== null)
}
