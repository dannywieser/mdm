import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { AppConfigError, resolveNotesConfig } from "app-config"
import { toLoggableError } from "mdm-util"

import { applyViewFilter } from "./filters/notes.filters"
import { collectMarkdownFiles } from "./notes.files"
import { EMPTY_MARKDOWN_NODE, parseMarkdownFile } from "./notes.parse"
import { scanMarkdownFile } from "./notes.scan"

export const notesHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { attachmentsDirectory, createdDateProperty, dateFormats, deriveTitleDate, notesDirectory, obsidianVault, timezone, views } =
      notesConfig

    console.log("[notes] config resolved", { notesDirectory, obsidianVault, timezone })

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    console.log(`[notes] collectMarkdownFiles found ${markdownFiles.length} file(s) in ${notesDirectory}`)

    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) =>
        scanMarkdownFile(filePath, notesDirectory, obsidianVault, dateFormats, createdDateProperty, deriveTitleDate),
      ),
    )
    const requestedView =
      typeof request.query["view"] === "string"
        ? request.query["view"]
        : undefined

    console.log(`[notes] applying view="${requestedView ?? "none"}" to ${scannedNotes.length} note(s)`)
    const filteredNotes = applyViewFilter(scannedNotes, views, requestedView, {
      dateFormats,
      timezone,
    })
    console.log(`[notes] ${filteredNotes.length}/${scannedNotes.length} note(s) passed view filter`)

    const includeContent = request.query["includeContent"] !== "false"

    const parsedNotes = includeContent
      ? await Promise.all(
          filteredNotes.map((note) => parseMarkdownFile(note, notesDirectory, attachmentsDirectory, scannedNotes)),
        )
      : filteredNotes.map((note) => ({ ...note, content: EMPTY_MARKDOWN_NODE }))

    response
      .status(200)
      .json({ notes: parsedNotes, notesDirectory, obsidianVault })
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
