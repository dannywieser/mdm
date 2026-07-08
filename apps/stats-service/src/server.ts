import { resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import { startServer } from "mdm-util/node"
import pinoHttp from "pino-http"

import { healthHandler } from "./handlers/health/health"
import { historyHandler } from "./handlers/history/history"
import { metaHandler } from "./handlers/meta/meta"
import { logger } from "./logger"

export const createApp = () => {
  const app = express()

  app.use(pinoHttp({ logger }))

  app.get("/health", healthHandler)
  app.get("/stats/meta", metaHandler)
  app.get("/stats/history", historyHandler)

  return app
}

const bootstrap = async (): Promise<void> => {
  const notesConfig = await resolveNotesConfig()
  logger.info({ notesConfig }, "Resolved notes config")

  const app = createApp()

  startServer(app, {
    logger,
    port: Number(process.env.PORT ?? 3004),
    serviceName: "stats-service",
  })
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to start stats-service due to configuration error",
    )
    throw error
  })
}
