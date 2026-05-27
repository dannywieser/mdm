import type { RequestHandler } from "express"

import type { ResolvedNotesConfig } from "../../config"

import { AppConfigError, resolveNotesConfig } from "../../config"
import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

const toLoggableError = (error: unknown): unknown =>
  error instanceof Error
    ? { message: error.message, stack: error.stack }
    : error

export const notesHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { dateFormats, notesDirectory, obsidianVault } = notesConfig
    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    const notes = await Promise.all(
      markdownFiles.map((filePath) => parseMarkdownFile(filePath, dateFormats))
    )

    response.status(200).json({ notes, notesDirectory, obsidianVault })
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
