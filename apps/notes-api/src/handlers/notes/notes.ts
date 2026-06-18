import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
import { applyViewFilter } from "./filters/notes.filters"
import { EMPTY_MARKDOWN_NODE, parseMarkdownFile } from "./notes.parse"
import { scanMarkdownFile } from "./notes.scan"

export const notesHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { attachmentsDirectory, createdDateProperty, dateFormats, deriveTitleDate, notesDirectory, obsidianVault, timezone, views } =
      notesConfig

    logger.debug({ notesDirectory, obsidianVault, timezone }, "[notes] config resolved")

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).toSorted((a, b) => a.localeCompare(b))
    logger.debug({ count: markdownFiles.length, notesDirectory }, "[notes] collectMarkdownFiles found files")

    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) =>
        scanMarkdownFile(filePath, notesDirectory, obsidianVault, dateFormats, createdDateProperty, deriveTitleDate, attachmentsDirectory),
      ),
    )
    const requestedView =
      typeof request.query.view === "string"
        ? request.query.view
        : undefined

    logger.debug({ total: scannedNotes.length, view: requestedView ?? "none" }, "[notes] applying view filter")
    const filteredNotes = applyViewFilter(scannedNotes, views, requestedView, {
      dateFormats,
      timezone,
    })
    logger.debug({ passed: filteredNotes.length, total: scannedNotes.length }, "[notes] view filter applied")

    const includeContent = request.query.includeContent !== "false"

    const parsedNotes = includeContent
      ? await Promise.all(
          filteredNotes.map((note) => parseMarkdownFile(note, notesDirectory, attachmentsDirectory, scannedNotes)),
        )
      : filteredNotes.map((note) => ({ ...note, content: EMPTY_MARKDOWN_NODE }))

    response
      .status(200)
      .json({ notes: parsedNotes, notesDirectory, obsidianVault })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load notes",
    )
    response.status(500).json({ error: "Unable to load notes" })
  }
}
