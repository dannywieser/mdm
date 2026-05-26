import type { RequestHandler } from "express"

import { collectMarkdownFiles, parseMarkdownFile } from "./notes.util"

const NOTES_DIRECTORY_ENV = "NOTES_DIRECTORY"

export const notesHandler: RequestHandler = async (_request, response) => {
  const notesDirectory = process.env[NOTES_DIRECTORY_ENV]

  if (!notesDirectory) {
    response
      .status(500)
      .json({ error: `${NOTES_DIRECTORY_ENV} environment variable is required` })
    return
  }

  try {
    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    const notes = await Promise.all(markdownFiles.map(parseMarkdownFile))

    response.status(200).json({ notes })
  } catch (error) {
    console.error("Unable to load notes", error)
    response.status(500).json({ error: "Unable to load notes" })
  }
}
