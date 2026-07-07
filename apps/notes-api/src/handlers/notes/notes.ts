import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler, Request } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
import { applyViewFilter } from "./filters/notes.filters"
import { createNotesScanCache } from "./notes.cache"
import { EMPTY_MARKDOWN_NODE, parseMarkdownFile } from "./notes.parse"
import { scanMarkdownFile } from "./notes.scan"

const CACHE_TTL_MS = 5 * 60 * 1000

const notesScanCache = createNotesScanCache(CACHE_TTL_MS)

const getQueryView = (request: Request): string | undefined => {
  const view = request.query.view
  if (typeof view === "string") {
    return view
  }
  return undefined
}

const getQueryIncludeContent = (request: Request): boolean => {
  const includeContent = request.query.includeContent
  if (typeof includeContent === "string") {
    return includeContent !== "false"
  }
  return true
}

export const notesHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined
  const requestedView = getQueryView(request)
  const includeContent = getQueryIncludeContent(request)

  try {
    const scannedNotes = await notesScanCache.get(async () => {
      notesConfig = await resolveNotesConfig()
      const { notesDirectory } = notesConfig

      const markdownFiles = (await collectMarkdownFiles(notesDirectory)).toSorted(
        (a, b) => a.localeCompare(b),
      )
      logger.debug(
        { count: markdownFiles.length, notesDirectory },
        "[notes] collectMarkdownFiles found files",
      )

      return Promise.all(
        markdownFiles.map((filePath) => scanMarkdownFile(filePath)),
      )
    })

    logger.debug(
      { total: scannedNotes.length, view: requestedView ?? "none" },
      "[notes] applying view filter",
    )
    const filteredNotes = await applyViewFilter(scannedNotes, requestedView)
    logger.debug(
      { passed: filteredNotes.length, total: scannedNotes.length },
      "[notes] view filter applied",
    )

    const parsedNotes = includeContent
      ? await Promise.all(
          filteredNotes.map((note) => parseMarkdownFile(note, scannedNotes)),
        )
      : filteredNotes.map((note) => ({ ...note, content: EMPTY_MARKDOWN_NODE }))

    response.status(200).json({ notes: parsedNotes })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load notes",
    )
    response.status(500).json({ error: "Unable to load notes" })
  }
}
