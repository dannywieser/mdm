import express from "express"
import morgan from "morgan"
import { createClient } from "redis"

import { createFlagsHandler } from "./handlers/flags/flags"
import { healthHandler } from "./handlers/health/health"

type RuntimeRedisClient = FlagRedisClient & {
  connect: () => Promise<void>
  on: (event: "error", listener: (error: unknown) => void) => void
}

export type FlagRedisClient = {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<unknown>
}

export const createApp = (redisClient: FlagRedisClient) => {
  const app = express()

  app.use(morgan("combined"))

  const flagsHandler = createFlagsHandler(redisClient)

  app.get("/health", healthHandler)
  app.post("/flags/:id/:flag", flagsHandler)
  app.patch("/flags/:id/:flag", flagsHandler)

  return app
}

export const createRedisClient = (
  redisUrl: string,
): RuntimeRedisClient => {
  const client = createClient({
    url: redisUrl,
  })

  return {
    connect: async () => {
      await client.connect()
    },
    get: async (key) => client.get(key),
    on: (event, listener) => {
      client.on(event, listener)
    },
    set: async (key, value) => client.set(key, value),
  }
}

const startServer = async (): Promise<void> => {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
  const port = Number(process.env.PORT ?? 3001)
  const redisClient = createRedisClient(redisUrl)

  redisClient.on("error", (error) => {
    console.error("Redis client error", error)
  })

  await redisClient.connect()

  const app = createApp(redisClient)

  app.listen(port, () => {
    console.log(`flag-manager listening on ${port}`)
  })
}

if (require.main === module) {
  void startServer()
}
