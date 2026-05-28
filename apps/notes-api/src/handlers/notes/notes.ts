import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { AppConfigError, resolveNotesConfig } from "app-config"
import { toLoggableError } from "mdm-util"

import { applyViewFilter } from "./notes.filters"
import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

export const notesHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { dateFormats, notesDirectory, obsidianVault, timezone, views } =
      notesConfig

    console.log("[notes] config resolved", { notesDirectory, obsidianVault, timezone })

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    console.log(`[notes] collectMarkdownFiles found ${markdownFiles.length} file(s) in ${notesDirectory}`)

    const notes = await Promise.all(
      markdownFiles.map((filePath) =>
        parseMarkdownFile(filePath, notesDirectory, obsidianVault, dateFormats),
      ),
    )
    const requestedView =
      typeof request.query["view"] === "string"
        ? request.query["view"]
        : undefined

    console.log(`[notes] applying view="${requestedView ?? "none"}" to ${notes.length} note(s)`)
    const filteredNotes = applyViewFilter(notes, views, requestedView, {
      dateFormats,
      timezone,
    })
    console.log(`[notes] ${filteredNotes.length}/${notes.length} note(s) passed view filter`)

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
      notesConfig: notesConfig ?? null,
    })
    response.status(500).json({ error: "Unable to load notes" })
  }
}
