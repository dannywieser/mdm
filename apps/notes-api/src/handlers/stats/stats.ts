import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"
import path from "node:path"

import { logger } from "../../logger"
import { scanMarkdownFile } from "../notes/notes.scan"
import { countFilesRecursive } from "./stats.files"
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

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).toSorted((a, b) => a.localeCompare(b))
    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) => scanMarkdownFile(filePath)),
    )

    const now = new Date()
    const absoluteAttachmentsDir = attachmentsDirectory
      ? path.join(notesDirectory, attachmentsDirectory)
      : ""
    const totalAttachments = await countFilesRecursive(absoluteAttachmentsDir)

    response.status(200).json({
      folderBreakdown: buildFolderBreakdown(scannedNotes),
      modifiedToday: countModifiedToday(scannedNotes, timezone),
      notesCreated: buildNotesCreated(scannedNotes, now),
      notesPerDay: buildNotesPerDay(scannedNotes, timezone, now),
      notesWithoutCreatedDate: countNotesWithoutCreatedDate(scannedNotes),
      totalAttachments,
      totalFolders: countFolders(scannedNotes),
      totalNotes: scannedNotes.length,
      trends: buildTrends(scannedNotes, now),
    })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load stats",
    )
    response.status(500).json({ error: "Unable to load stats" })
  }
}
