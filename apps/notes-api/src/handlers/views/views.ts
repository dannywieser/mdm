import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { toLoggableError } from "mdm-util"

import { logger } from "../../logger"
import { getNotesRedisClient } from "../notes/sources/notesRedisClient"
import { resolveNoteSource } from "../notes/sources/resolveNoteSource"
import { buildViews } from "./views.util"

export const viewsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const scannedNotes = await resolveNoteSource(notesConfig, getNotesRedisClient()).listNotes()

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
