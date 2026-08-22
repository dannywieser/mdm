import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { assertDirectoryReadable } from "mdm-util/node"

export const healthHandler: RequestHandler = async (_request, response) => {
  try {
    const { notesDirectory, notesSource } = await resolveNotesConfig()

    if (notesSource === "obsidian") {
      await assertDirectoryReadable(notesDirectory)
    }

    response.status(200).json({ status: "ok" })
  } catch (error) {
    response.status(503).json({
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    })
  }
}
