import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
import { scanFile } from "../../../../../packages/markdown/src/files/scanFile"
import { buildViews } from "./views.util"

export const viewsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { notesDirectory } = notesConfig

    const files = (await collectMarkdownFiles(notesDirectory)).toSorted(
      (a, b) => a.localeCompare(b),
    )
    const scanned = await Promise.all(
      files.map((filePath) => scanFile(filePath)),
    )

    response.status(200).json({
      views: await buildViews(scanned),
    })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load views",
    )
    response.status(500).json({ error: "Unable to load views" })
  }
}
