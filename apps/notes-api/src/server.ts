import { resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import { startServer } from "mdm-util/node"
import pinoHttp from "pino-http"

import { healthHandler } from "./handlers/health/health"
import { notesHandler } from "./handlers/notes/notes"
import { viewsHandler } from "./handlers/views/views"
import { logger } from "./logger"

export const createApp = () => {
  const app = express()

  app.use(pinoHttp({ logger }))

  app.get("/health", healthHandler)
  app.get("/notes", notesHandler)
  app.get("/views", viewsHandler)

  return app
}

const bootstrap = async (): Promise<void> => {
  const notesConfig = await resolveNotesConfig()
  logger.info({ notesConfig }, "Resolved notes config")

  const app = createApp()

  startServer(app, {
    logger,
    port: Number(process.env.PORT ?? 3000),
    serviceName: "notes-api",
  })
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to start notes-api due to configuration error",
    )
    throw error
  })
}
