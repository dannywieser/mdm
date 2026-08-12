import express from "express"
import { toLoggableError } from "mdm-util"
import { startServer } from "mdm-util/node"
import { createRedisClient } from "mdm-util/redis"
import pinoHttp from "pino-http"

import type { HealthRedisClient } from "./handlers/health/health"
import type { SyncRedisClient } from "./handlers/sync/sync.types"

import { createHealthHandler } from "./handlers/health/health"
import { createSyncHandler } from "./handlers/sync/sync"
import { logger } from "./logger"

const JSON_BODY_LIMIT = "50mb"

export const createApp = (redisClient: HealthRedisClient & SyncRedisClient) => {
  const app = express()

  app.use(pinoHttp({ logger }))
  app.use(express.json({ limit: JSON_BODY_LIMIT }))

  app.get("/health", createHealthHandler(redisClient))
  app.post("/notes/sync", createSyncHandler(redisClient))

  return app
}

const bootstrap = async (): Promise<void> => {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
  const redisClient = createRedisClient(redisUrl)

  redisClient.on("error", (error) => {
    logger.error({ error: toLoggableError(error) }, "Redis client error")
  })

  await redisClient.connect()

  const app = createApp(redisClient)

  startServer(app, {
    logger,
    onShutdown: () => redisClient.disconnect(),
    port: Number(process.env.PORT ?? 3005),
    serviceName: "notes-ingest",
  })
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to start notes-ingest due to configuration error",
    )
    throw error
  })
}
