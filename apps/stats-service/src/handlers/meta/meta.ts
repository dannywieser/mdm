import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles, parseFrontMatter } from "markdown"
import { mapWithConcurrency, toLoggableError } from "mdm-util"
import { countFilesByExtension } from "mdm-util/node"
import { promises as fs } from "node:fs"
import path from "node:path"

import { logger } from "../../logger"
import { createStatsMetaCache } from "./meta.cache"
import { countDistinctFolders, resolveNoteFolder, sumWordCounts } from "./meta.util"

const CACHE_TTL_MS = 5 * 60 * 1000
const READ_CONCURRENCY = 20

const statsMetaCache = createStatsMetaCache(CACHE_TTL_MS)

export const metaHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    const result = await statsMetaCache.get(async () => {
      notesConfig = await resolveNotesConfig()
      const { attachmentsDirectory, notesDirectory } = notesConfig

      const markdownFiles = await collectMarkdownFiles(notesDirectory)
      const bodies = await mapWithConcurrency(markdownFiles, READ_CONCURRENCY, async (filePath) => {
        const source = await fs.readFile(filePath, "utf8")
        return parseFrontMatter(source).body
      })
      const folders = markdownFiles.map((filePath) => resolveNoteFolder(notesDirectory, filePath))

      const absoluteAttachmentsDir = attachmentsDirectory
        ? path.join(notesDirectory, attachmentsDirectory)
        : ""
      const totalAttachments = absoluteAttachmentsDir
        ? await countFilesByExtension(absoluteAttachmentsDir)
        : {}

      return {
        totalAttachments,
        totalFolders: countDistinctFolders(folders),
        totalNotes: markdownFiles.length,
        totalWords: sumWordCounts(bodies),
      }
    })

    response.status(200).json(result)
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load stats",
    )
    response.status(500).json({ error: "Unable to load stats" })
  }
}
