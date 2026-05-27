import type { RequestHandler } from "express"

import { AppConfigError, resolveNotesDirectory } from "../../config"
import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

export const notesHandler: RequestHandler = async (_request, response) => {
  try {
    const notesDirectory = await resolveNotesDirectory()
    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    const notes = await Promise.all(markdownFiles.map(parseMarkdownFile))

    response.status(200).json({ notes })
  } catch (error) {
    if (error instanceof AppConfigError) {
      response.status(500).json({ error: error.message })
      return
    }

    console.error("Unable to load notes", error)
    response.status(500).json({ error: "Unable to load notes" })
  }
}
