import { resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import pinoHttp from "pino-http"

import { healthHandler } from "./handlers/health/health"
import { notesHandler } from "./handlers/notes/handler"
import { statsHandler } from "./handlers/stats/stats"
import { viewsHandler } from "./handlers/views/views"
import { logger } from "./logger"

export const createApp = () => {
  const app = express()

  app.use(pinoHttp({ logger }))

  app.get("/health", healthHandler)
  app.get("/notes", notesHandler)
  app.get("/stats", statsHandler)
  app.get("/views", viewsHandler)

  return app
}

export const logStartupConfig = async (): Promise<void> => {
  try {
    const notesConfig = await resolveNotesConfig()
    logger.info({ notesConfig }, "Resolved notes config")
  } catch (error) {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to resolve notes config on startup",
    )
  }
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3000)

  app.listen(port, () => {
    logger.info({ port }, "notes-api listening")
    void logStartupConfig()
  })
}
