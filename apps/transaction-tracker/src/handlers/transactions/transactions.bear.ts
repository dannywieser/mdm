import type { TransactionsConfig } from "app-config"
import type { ScannedNote } from "markdown"

import type { TransactionDefinition } from "./transactions.types"

import { buildTransactionDefinition } from "./transactions.util"
import { isInFolder } from "./transactionsFolder"

/**
 * Bear-sourced equivalent of the file scan: notes already arrive parsed from
 * Redis, so this only has to pick out the ones that describe a transaction.
 * The `folder` restriction applies here too, matched against each note's
 * folder rather than a filesystem path.
 */
export const scanTransactionDefinitionsFromNotes = (
  notes: readonly ScannedNote[],
  config: TransactionsConfig,
  createdDateProperty: string,
  dateFormats: readonly string[],
): TransactionDefinition[] =>
  notes
    .filter(({ folder }) => isInFolder(folder, config.folder))
    .map((note) =>
      buildTransactionDefinition(
        note.frontmatter,
        { noteId: note.id, obsidianUrl: note.obsidianUrl, title: note.title },
        config,
        createdDateProperty,
        dateFormats,
      ),
    )
    .filter((definition): definition is TransactionDefinition => definition !== null)
