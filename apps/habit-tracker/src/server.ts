import express from "express"
import pinoHttp from "pino-http"

import { habitDetailHandler } from "./handlers/habit-detail/habit-detail"
import { habitsHandler } from "./handlers/habits/habits-handler"
import { healthHandler } from "./handlers/health/health"
import { logger } from "./logger"

export const createApp = () => {
  const app = express()

  app.use(pinoHttp({ logger }))

  app.get("/health", healthHandler)
  app.get("/habits", habitsHandler)
  app.get("/habits/:id", habitDetailHandler)

  return app
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3003)

  app.listen(port, () => {
    logger.info({ port }, "habit-tracker listening")
  })
}
