import type { ResolvedNotesConfig } from "app-config"

import { collectMarkdownFiles } from "markdown"

import type { NoteSource } from "./sources.types"

import { logger } from "../../../logger"
import { scanMarkdownFile } from "../notes.scan"

/**
 * Note source backed by the local Obsidian-style markdown vault: walks
 * `notesConfig.notesDirectory` and scans every file found there.
 */
export const createFileNoteSource = (notesConfig: ResolvedNotesConfig): NoteSource => ({
  listNotes: async () => {
    const { notesDirectory } = notesConfig

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).toSorted(
      (a, b) => a.localeCompare(b),
    )
    logger.debug(
      { count: markdownFiles.length, notesDirectory },
      "[notes] collectMarkdownFiles found files",
    )

    return Promise.all(markdownFiles.map((filePath) => scanMarkdownFile(filePath)))
  },
})
