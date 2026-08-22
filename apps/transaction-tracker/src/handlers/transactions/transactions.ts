import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"
import type { ScannedNote } from "markdown"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toISODateString, toLoggableError } from "mdm-util"

import type { TransactionDefinition, TransactionsResponse } from "./transactions.types"

import { logger } from "../../logger"
import { loadBearNotes } from "../../redis/loadBearNotes"
import { scanTransactionDefinitionsFromNotes } from "./transactions.bear"
import { scanTransactionDefinitions } from "./transactions.files"
import { resolveTransactionRange } from "./transactions.range"
import { buildTotals } from "./transactions.totals"
import { buildOccurrences } from "./transactions.util"

const loadDefinitions = async (config: ResolvedNotesConfig): Promise<TransactionDefinition[]> => {
  const { createdDateProperty, dateFormats, notesDirectory, notesSource, transactions } = config

  if (notesSource === "bear") {
    const notes: ScannedNote[] = await loadBearNotes()
    return scanTransactionDefinitionsFromNotes(notes, transactions, createdDateProperty, dateFormats)
  }

  return scanTransactionDefinitions(await collectMarkdownFiles(notesDirectory))
}

export const transactionsHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const today = toISODateString(new Date(), notesConfig.timezone)

    let range
    try {
      range = resolveTransactionRange(request.query, today)
    } catch (error) {
      response.status(400).json({ error: error instanceof Error ? error.message : "Invalid range" })
      return
    }

    const definitions = await loadDefinitions(notesConfig)
    const transactions = buildOccurrences(definitions, range.from, range.to)

    const body: TransactionsResponse = {
      currency: notesConfig.transactions.currency,
      from: range.from,
      to: range.to,
      totals: buildTotals(transactions),
      transactions,
    }

    response.status(200).json(body)
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load transactions",
    )
    response.status(500).json({ error: "Unable to load transactions" })
  }
}
