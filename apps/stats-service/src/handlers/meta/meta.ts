import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles, parseFrontMatter } from "markdown"
import { toLoggableError } from "mdm-util"
import { countFilesByExtension } from "mdm-util/node"
import { promises as fs } from "node:fs"
import path from "node:path"

import { logger } from "../../logger"
import { countDistinctFolders, resolveNoteFolder, sumWordCounts } from "./meta.util"

export const metaHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { attachmentsDirectory, notesDirectory } = notesConfig

    const markdownFiles = await collectMarkdownFiles(notesDirectory)
    const bodies = await Promise.all(
      markdownFiles.map(async (filePath) => {
        const source = await fs.readFile(filePath, "utf8")
        return parseFrontMatter(source).body
      }),
    )
    const folders = markdownFiles.map((filePath) => resolveNoteFolder(notesDirectory, filePath))

    const absoluteAttachmentsDir = attachmentsDirectory
      ? path.join(notesDirectory, attachmentsDirectory)
      : ""
    const totalAttachments = absoluteAttachmentsDir
      ? await countFilesByExtension(absoluteAttachmentsDir)
      : {}

    response.status(200).json({
      totalAttachments,
      totalFolders: countDistinctFolders(folders),
      totalNotes: markdownFiles.length,
      totalWords: sumWordCounts(bodies),
    })
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load stats",
    )
    response.status(500).json({ error: "Unable to load stats" })
  }
}
