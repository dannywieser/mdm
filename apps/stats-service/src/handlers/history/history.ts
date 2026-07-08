import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles, extractNoteDates } from "markdown"
import { mapWithConcurrency, toLoggableError } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { HistoryNoteDates } from "./history.types"

import { logger } from "../../logger"
import { resolveNoteFolder } from "../meta/meta.util"
import { createStatsHistoryCache } from "./history.cache"
import { buildHistoryEntries, resolveCreatedDate } from "./history.util"

const CACHE_TTL_MS = 5 * 60 * 1000
const READ_CONCURRENCY = 20

const statsHistoryCache = createStatsHistoryCache(CACHE_TTL_MS)

const resolveTitle = (filePath: string): string => {
  const basename = path.basename(filePath)
  return basename.endsWith(".md") ? basename.slice(0, -3) : basename
}

const scanHistoryNote = async (
  filePath: string,
  notesDirectory: string,
  dateFormats: readonly string[],
): Promise<HistoryNoteDates> => {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath),
  ])
  const modifiedDate = stats.mtime.toISOString()
  const dates = Array.from(
    new Set([...extractNoteDates(resolveTitle(filePath), source, dateFormats), modifiedDate]),
  )

  return {
    createdDate: resolveCreatedDate(dates, dateFormats),
    folder: resolveNoteFolder(notesDirectory, filePath),
    modifiedDate,
  }
}

export const historyHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    const result = await statsHistoryCache.get(async () => {
      notesConfig = await resolveNotesConfig()
      const { dateFormats, notesDirectory, timezone } = notesConfig

      const markdownFiles = await collectMarkdownFiles(notesDirectory)
      const notes = await mapWithConcurrency(markdownFiles, READ_CONCURRENCY, (filePath) =>
        scanHistoryNote(filePath, notesDirectory, dateFormats),
      )

      return buildHistoryEntries(notes, timezone)
    })

    response.status(200).json(result)
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load stats history",
    )
    response.status(500).json({ error: "Unable to load stats history" })
  }
}
