import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { scanFile } from "markdown"
import { toLoggableError } from "mdm-util"
import { countFilesRecursive } from "mdm-util/node"
import path from "node:path"

import { logger } from "../../logger"
import {
  buildFolderBreakdown,
  buildNotesCreated,
  buildNotesPerDay,
  buildTrends,
  countFolders,
  countModifiedToday,
  countNotesWithoutCreatedDate,
} from "./stats.util"

export const statsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { attachmentsDirectory, notesDirectory, timezone } = notesConfig

    const files = (await collectMarkdownFiles(notesDirectory)).toSorted(
      (a, b) => a.localeCompare(b),
    )
    const scanned = await Promise.all(
      files.map((filePath) => scanFile(filePath)),
    )

    const now = new Date()
    const absoluteAttachmentsDir = attachmentsDirectory
      ? path.join(notesDirectory, attachmentsDirectory)
      : ""
    const totalAttachments = await countFilesRecursive(absoluteAttachmentsDir)

    response.status(200).json({
      folderBreakdown: buildFolderBreakdown(scanned),
      modifiedToday: countModifiedToday(scanned, timezone),
      notesCreated: buildNotesCreated(scanned, now),
      notesPerDay: buildNotesPerDay(scanned, timezone, now),
      notesWithoutCreatedDate: countNotesWithoutCreatedDate(scanned),
      totalAttachments,
      totalFolders: countFolders(scanned),
      totalNotes: scanned.length,
      trends: buildTrends(scanned, now),
    })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load stats",
    )
    response.status(500).json({ error: "Unable to load stats" })
  }
}
