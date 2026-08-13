import { resolveNotesConfig } from "app-config"
import express from "express"
import { toLoggableError } from "mdm-util"
import { startServer } from "mdm-util/node"
import { createRedisClient } from "mdm-util/redis"
import pinoHttp from "pino-http"

import { habitDetailHandler } from "./handlers/habit-detail/habit-detail"
import { habitsHandler } from "./handlers/habits/habits"
import { healthHandler } from "./handlers/health/health"
import { logger } from "./logger"
import { setNotesRedisClient } from "./redis/notesRedisClient"

export const createApp = () => {
  const app = express()

  app.use(pinoHttp({ logger }))

  app.get("/health", healthHandler)
  app.get("/habits", habitsHandler)
  app.get("/habits/:id", habitDetailHandler)

  return app
}

const bootstrap = async (): Promise<void> => {
  const notesConfig = await resolveNotesConfig()
  logger.info({ notesConfig }, "Resolved notes config")

  let onShutdown: (() => Promise<void>) | undefined

  if (notesConfig.notesSource === "bear") {
    const redisClient = createRedisClient(process.env.REDIS_URL ?? "redis://localhost:6379")
    redisClient.on("error", (error) => {
      logger.error({ error: toLoggableError(error) }, "Redis client error")
    })
    await redisClient.connect()
    setNotesRedisClient(redisClient)
    onShutdown = () => redisClient.disconnect()
  }

  const app = createApp()

  startServer(app, {
    logger,
    onShutdown,
    port: Number(process.env.PORT ?? 3003),
    serviceName: "habit-tracker",
  })
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to start habit-tracker due to configuration error",
    )
    throw error
  })
}
