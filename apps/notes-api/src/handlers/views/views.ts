import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
import { scanMarkdownFile } from "../notes/scanFile"
import { buildViews } from "./views.util"

export const viewsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { notesDirectory } = notesConfig

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).toSorted(
      (a, b) => a.localeCompare(b),
    )
    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) => scanMarkdownFile(filePath)),
    )

    response.status(200).json({
      views: await buildViews(scannedNotes),
    })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load views",
    )
    response.status(500).json({ error: "Unable to load views" })
  }
}
