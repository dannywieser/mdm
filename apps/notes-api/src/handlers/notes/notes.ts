import type { RequestHandler } from "express"

import type { ResolvedNotesConfig } from "../../config"

import { AppConfigError, resolveNotesConfig } from "../../config"
import { toLoggableError } from "../../logging"
import {
  applyViewFilter,
  collectMarkdownFiles,
  parseMarkdownFile
} from "./notes.util"

export const notesHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { dateFormats, notesDirectory, obsidianVault, views } = notesConfig
    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    const notes = await Promise.all(
      markdownFiles.map((filePath) => parseMarkdownFile(filePath, dateFormats))
    )
    const requestedView =
      typeof request.query["view"] === "string"
        ? request.query["view"]
        : undefined
    const filteredNotes = applyViewFilter(notes, views, requestedView)

    response
      .status(200)
      .json({ notes: filteredNotes, notesDirectory, obsidianVault })
  } catch (error) {
    if (error instanceof AppConfigError) {
      response.status(500).json({ error: error.message })
      return
    }

    console.error("Unable to load notes", {
      error: toLoggableError(error),
      notesConfig: notesConfig ?? null
    })
    response.status(500).json({ error: "Unable to load notes" })
  }
}
