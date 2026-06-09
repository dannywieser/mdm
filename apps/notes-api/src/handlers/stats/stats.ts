import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { AppConfigError, resolveNotesConfig } from "app-config"
import { toLoggableError } from "mdm-util"
import path from "node:path"

import { collectMarkdownFiles } from "../notes/notes.files"
import { scanMarkdownFile } from "../notes/notes.scan"
import { countFilesRecursive } from "./stats.files"
import {
  buildFolderBreakdown,
  buildNotesCreated,
  buildNotesPerDay,
  buildTrends,
  buildViewCounts,
  countFolders,
  countModifiedToday,
  countNotesWithoutCreatedDate,
} from "./stats.util"

export const statsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const {
      attachmentsDirectory,
      createdDateProperty,
      dateFormats,
      deriveTitleDate,
      homeStats,
      notesDirectory,
      obsidianVault,
      timezone,
      views,
    } = notesConfig

    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    const scannedNotes = await Promise.all(
      markdownFiles.map((filePath) =>
        scanMarkdownFile(filePath, notesDirectory, obsidianVault, dateFormats, createdDateProperty, deriveTitleDate),
      ),
    )

    const now = new Date()
    const context = { dateFormats, timezone }
    const attachmentsPath = path.join(notesDirectory, attachmentsDirectory)
    const totalAttachments = await countFilesRecursive(attachmentsPath)

    response.status(200).json({
      folderBreakdown: buildFolderBreakdown(scannedNotes),
      homeStats,
      modifiedToday: countModifiedToday(scannedNotes, timezone),
      timezone,
      notesCreated: buildNotesCreated(scannedNotes, now),
      notesPerDay: buildNotesPerDay(scannedNotes, timezone, now),
      notesWithoutCreatedDate: countNotesWithoutCreatedDate(scannedNotes),
      totalAttachments,
      totalFolders: countFolders(scannedNotes),
      totalNotes: scannedNotes.length,
      trends: buildTrends(scannedNotes, now),
      views: buildViewCounts(scannedNotes, views, context),
    })
  } catch (error) {
    if (error instanceof AppConfigError) {
      response.status(500).json({ error: error.message })
      return
    }

    console.error("Unable to load stats", {
      error: toLoggableError(error),
      notesConfig: notesConfig ?? null,
    })
    response.status(500).json({ error: "Unable to load stats" })
  }
}
