import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { AppConfigError, resolveNotesConfig } from "app-config"
import { toLoggableError } from "mdm-util"

import { collectMarkdownFiles } from "../notes/notes.files"
import { scanMarkdownFile } from "../notes/notes.scan"
import { buildViewCounts, countModifiedToday } from "./stats.util"

export const statsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { dateFormats, notesDirectory, obsidianVault, timezone, views } = notesConfig

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) =>
        scanMarkdownFile(filePath, notesDirectory, obsidianVault, dateFormats),
      ),
    )

    const context = { dateFormats, timezone }

    response.status(200).json({
      modifiedToday: countModifiedToday(scannedNotes, timezone),
      totalNotes: scannedNotes.length,
      views: buildViewCounts(scannedNotes, views, context),
    })
  } catch (error) {
    if (error instanceof AppConfigError) {
      response.status(500).json({ error: error.message })
      return
    }

    console.error("Unable to load stats", {
      error: toLoggableError(error),
      notesConfig: notesConfig ?? null,
    })
    response.status(500).json({ error: "Unable to load stats" })
  }
}
