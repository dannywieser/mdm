import { resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import pinoHttp from "pino-http"

import { healthHandler } from "./handlers/health/health"
import { metaHandler } from "./handlers/meta/meta"
import { logger } from "./logger"

export const createApp = () => {
  const app = express()

  app.use(pinoHttp({ logger }))

  app.get("/health", healthHandler)
  app.get("/stats/meta", metaHandler)

  return app
}

const startServer = async (): Promise<void> => {
  const notesConfig = await resolveNotesConfig()
  logger.info({ notesConfig }, "Resolved notes config")

  const app = createApp()
  const port = Number(process.env.PORT ?? 3004)

  app.listen(port, () => {
    logger.info({ port }, "stats-service listening")
  })
}

if (require.main === module) {
  startServer().catch((error: unknown) => {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to start stats-service due to configuration error",
    )
    throw error
  })
}
