import express from "express"
import { startServer } from "mdm-util/node"
import pinoHttp from "pino-http"

import { habitDetailHandler } from "./handlers/habit-detail/habit-detail"
import { habitsHandler } from "./handlers/habits/habits"
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

  startServer(app, {
    logger,
    port: Number(process.env.PORT ?? 3003),
    serviceName: "habit-tracker",
  })
}
