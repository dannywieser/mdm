import express from "express"
import { toLoggableError } from "mdm-util"
import morgan from "morgan"
import { createClient } from "redis"

import type { ImageRedisClient } from "./handlers/images/images.types"

import { healthHandler } from "./handlers/health/health"
import { createImageHandler, resolveImageProxyConfig } from "./handlers/images/images"

type RuntimeRedisClient = ImageRedisClient & {
  connect: () => Promise<void>
  on: (event: "error", listener: (error: unknown) => void) => void
}

export const createApp = (redisClient: ImageRedisClient) => {
  const app = express()

  app.use(morgan("combined"))

  app.get("/health", healthHandler)
  app.get("/images", createImageHandler(resolveImageProxyConfig(), redisClient))

  return app
}

export const createRedisClient = (redisUrl: string): RuntimeRedisClient => {
  const client = createClient({ url: redisUrl })

  return {
    connect: async () => {
      await client.connect()
    },
    get: async (key) => client.get(key),
    on: (event, listener) => {
      client.on(event, listener)
    },
    set: async (key, value, options) => client.set(key, value, options),
  }
}

if (require.main === module) {
  const start = async (): Promise<void> => {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
    const port = Number(process.env.PORT ?? 3002)
    const redisClient = createRedisClient(redisUrl)

    redisClient.on("error", (error) => {
      console.error("Redis client error", toLoggableError(error))
    })

    await redisClient.connect()

    const app = createApp(redisClient)

    app.listen(port, () => {
      console.log(`image-server listening on ${port}`)
    })
  }

  start().catch((error: unknown) => {
    console.error(
      "Unable to start image-server due to configuration error",
      toLoggableError(error),
    )
    process.exit(1)
  })
}
