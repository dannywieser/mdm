import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import {
  collectMarkdownFiles,
  MarkdownNode,
  scanFile,
  ScannedNote,
} from "markdown"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
import { applyViewFilter } from "./filters/notes.filters"
import { getQueryIncludeContent, getQueryView } from "./handler.util"
import { parseNote } from "./parseNote"

export const EMPTY_MARKDOWN_NODE: MarkdownNode = { type: "root", children: [] }

const loadNotes = async (notesDirectory: string): Promise<ScannedNote[]> => {
  // 1. load all markdown files from the notes directory
  const allNotes = await collectMarkdownFiles(notesDirectory)
  // 2. scan all markdown files to extract metadata and frontmatter
  return Promise.all(allNotes.map((file) => scanFile(file)))
}

export const notesHandler: RequestHandler = async (request, response) => {
  const view = getQueryView(request)
  const includeContent = getQueryIncludeContent(request)
  try {
    const { notesDirectory } = await resolveNotesConfig()
    const rawNotes = await loadNotes(notesDirectory)
    const filteredNotes = await applyViewFilter(rawNotes, view)
    const parsedNotes = includeContent
      ? await Promise.all(
          filteredNotes.map((note) => parseNote(note, rawNotes)),
        )
      : filteredNotes.map((note) => ({ ...note, content: EMPTY_MARKDOWN_NODE }))
    response.status(200).json({ notes: parsedNotes })
  } catch (error) {
    logger.error({ error: toLoggableError(error) }, "Unable to load notes")
    response.status(500).json({ error: "Unable to load notes" })
  }
}
