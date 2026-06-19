import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
import { scanMarkdownFile } from "../notes/notes.scan"
import { buildViews } from "./views.util"

export const viewsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { createdDateProperty, dateFormats, notesDirectory, obsidianVault, timezone, views } =
      notesConfig

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).toSorted((a, b) => a.localeCompare(b))
    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) =>
        scanMarkdownFile(filePath, notesDirectory, obsidianVault, dateFormats, createdDateProperty),
      ),
    )

    const context = { dateFormats, timezone }

    response.status(200).json({
      views: buildViews(scannedNotes, views, context),
    })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load views",
    )
    response.status(500).json({ error: "Unable to load views" })
  }
}
