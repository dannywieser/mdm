import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
// import { applyViewFilter } from "./filters/notes.filters"
// import { EMPTY_MARKDOWN_NODE, parseMarkdownFile } from "./notes.parse"
import { scanMarkdownFile } from "./notes.scan"
import { ScannedNote } from "./notes.types"

// const getQueryView = (request: Request): string | undefined => {
//   const view = request.query.view
//   if (typeof view === "string") {
//     return view
//   }
//   return undefined
// }

// const getQueryIncludeContent = (request: Request): boolean => {
//   const includeContent = request.query.includeContent
//   if (typeof includeContent === "string") {
//     return includeContent !== "false"
//   }
//   return true
// }

const loadNotes = async (notesDirectory: string): Promise<ScannedNote[]> => {
  // 1. load all markdown files from the notes directory
  const allNotes = await collectMarkdownFiles(notesDirectory)
  console.log(`Found ${allNotes.length} markdown files in ${notesDirectory}`)
  // 2. scan all markdown files to extract metadata and frontmatter
  const scannedNotes = await Promise.all(
    allNotes.map((file) => scanMarkdownFile(file)),
  )
  return scannedNotes
}

export const notesHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined
  // const requestedView = getQueryView(request)
  // const includeContent = getQueryIncludeContent(request)

  try {
    const { notesDirectory } = await resolveNotesConfig()
    const notes = await loadNotes(notesDirectory)

    // logger.debug(
    //   { total: scannedNotes.length, view: requestedView ?? "none" },
    //   "[notes] applying view filter",
    // )
    // const filteredNotes = await applyViewFilter(scannedNotes, requestedView)
    // logger.debug(
    //   { passed: filteredNotes.length, total: scannedNotes.length },
    //   "[notes] view filter applied",
    // )

    // const parsedNotes = includeContent
    //   ? await Promise.all(
    //       filteredNotes.map((note) => parseMarkdownFile(note, scannedNotes)),
    //     )
    //   : filteredNotes.map((note) => ({ ...note, content: EMPTY_MARKDOWN_NODE }))

    response.status(200).json({ notes })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load notes",
    )
    console.log(error)
    response.status(500).json({ error: "Unable to load notes" })
  }
}
