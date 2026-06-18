import express from "express"
import { toLoggableError } from "mdm-util"
import { createRedisClient } from "mdm-util/redis"
import morgan from "morgan"

import type { ImageRedisClient } from "./handlers/images/images.types"

import { healthHandler } from "./handlers/health/health"
import {
  createImageHandler,
  resolveImageProxyConfig,
} from "./handlers/images/images"

const noopRedisClient: ImageRedisClient = {
  get: () => Promise.resolve(null),
  set: () => Promise.resolve(),
}

export const createApp = (redisClient: ImageRedisClient = noopRedisClient) => {
  const app = express()

  app.use(morgan("combined"))

  app.get("/health", healthHandler)
  app.get("/images", createImageHandler(resolveImageProxyConfig(), redisClient))

  return app
}

if (require.main === module) {
  const start = async (): Promise<void> => {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
    const port = Number(process.env.PORT ?? 3002)
    const redisClient = createRedisClient(redisUrl)

    redisClient.on("error", (error) => {
      console.error("Redis client error", toLoggableError(error))
    })

    let cacheClient: ImageRedisClient = noopRedisClient
    try {
      await redisClient.connect()
      cacheClient = redisClient
    } catch (error) {
      console.error(
        "Redis unavailable, image caching disabled",
        toLoggableError(error),
      )
    }

    const app = createApp(cacheClient)

    const { imagesRoot } = resolveImageProxyConfig()

    app.listen(port, () => {
      console.log(`image-server listening on ${port}`, { imagesRoot })
    })
  }

  start().catch((error: unknown) => {
    console.error(
      "Unable to start image-server due to configuration error",
      toLoggableError(error),
    )
    throw error
  })
}
