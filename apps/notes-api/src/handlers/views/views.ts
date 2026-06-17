import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { AppConfigError, resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import { scanMarkdownFile } from "../notes/notes.scan"
import { buildViews } from "./views.util"

export const viewsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { createdDateProperty, dateFormats, deriveTitleDate, notesDirectory, obsidianVault, timezone, views } =
      notesConfig

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).toSorted((a, b) => a.localeCompare(b))
    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) =>
        scanMarkdownFile(filePath, notesDirectory, obsidianVault, dateFormats, createdDateProperty, deriveTitleDate),
      ),
    )

    const context = { dateFormats, timezone }

    response.status(200).json({
      views: buildViews(scannedNotes, views, context),
    })
  } catch (error) {
    if (error instanceof AppConfigError) {
      response.status(500).json({ error: error.message })
      return
    }

    console.error("Unable to load views", {
      error: toLoggableError(error),
      notesConfig: notesConfig ?? null,
    })
    response.status(500).json({ error: "Unable to load views" })
  }
}
