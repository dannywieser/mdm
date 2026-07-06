import express from "express"
import { toLoggableError } from "mdm-util"
import { createRedisClient } from "mdm-util/redis"
import pinoHttp from "pino-http"

import type {
  FlagDefinition,
  FlagRedisClient,
} from "./handlers/flags/flags.types"
import type { HealthRedisClient } from "./handlers/health/health"

import { resolveFlagDefinitions } from "./config"
import { createFlagsHandler } from "./handlers/flags/flags"
import { createHealthHandler } from "./handlers/health/health"
import { logger } from "./logger"

export const createApp = (
  redisClient: FlagRedisClient & HealthRedisClient,
  flagDefinitions: Record<string, FlagDefinition>,
) => {
  const app = express()

  app.use(pinoHttp({ logger }))

  const flagsHandler = createFlagsHandler(redisClient, flagDefinitions)

  app.get("/health", createHealthHandler(redisClient))
  app.get("/flags/:id/:flag", flagsHandler)
  app.post("/flags/:id/:flag", flagsHandler)
  app.patch("/flags/:id/:flag", flagsHandler)

  return app
}

const startServer = async (): Promise<void> => {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
  const port = Number(process.env.PORT ?? 3001)
  const redisClient = createRedisClient(redisUrl)
  const flagDefinitions = await resolveFlagDefinitions()

  redisClient.on("error", (error) => {
    logger.error({ error }, "Redis client error")
  })

  await redisClient.connect()

  const app = createApp(redisClient, flagDefinitions)

  app.listen(port, () => {
    logger.info({ flagDefinitions, port }, "flag-manager listening")
  })
}

if (require.main === module) {
  startServer().catch((error: unknown) => {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to start flag-manager due to configuration error",
    )
    throw error
  })
}
