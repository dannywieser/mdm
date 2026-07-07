import express from "express"
import { toLoggableError } from "mdm-util"
import { startServer } from "mdm-util/node"
import { createRedisClient } from "mdm-util/redis"
import pinoHttp from "pino-http"

import type { ImageRedisClient } from "./handlers/images/images.types"

import { healthHandler } from "./handlers/health/health"
import {
  createImageHandler,
  resolveImageProxyConfig,
} from "./handlers/images/images"
import { logger } from "./logger"

const noopRedisClient: ImageRedisClient = {
  get: () => Promise.resolve(null),
  set: () => Promise.resolve(),
}

export const createApp = (redisClient: ImageRedisClient = noopRedisClient) => {
  const app = express()

  app.use(pinoHttp({ logger }))

  app.get("/health", healthHandler)
  app.get("/images", createImageHandler(resolveImageProxyConfig(), redisClient))

  return app
}

if (require.main === module) {
  const bootstrap = async (): Promise<void> => {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
    const redisClient = createRedisClient(redisUrl)

    redisClient.on("error", (error) => {
      logger.error({ error: toLoggableError(error) }, "Redis client error")
    })

    let cacheClient: ImageRedisClient = noopRedisClient
    let redisConnected = false

    try {
      await redisClient.connect()
      cacheClient = redisClient
      redisConnected = true
    } catch (error) {
      logger.error(
        { error: toLoggableError(error) },
        "Redis unavailable, image caching disabled",
      )
    }

    const app = createApp(cacheClient)
    const { imagesRoot } = resolveImageProxyConfig()

    logger.info({ imagesRoot }, "Resolved image-server config")

    startServer(app, {
      logger,
      onShutdown: redisConnected ? () => redisClient.disconnect() : undefined,
      port: Number(process.env.PORT ?? 3002),
      serviceName: "image-server",
    })
  }

  bootstrap().catch((error: unknown) => {
    logger.error(
      { error: toLoggableError(error) },
      "Unable to start image-server due to configuration error",
    )
    throw error
  })
}
